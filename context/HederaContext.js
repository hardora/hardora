import { Buffer } from "buffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createConsensusTopic, decodeConsensusMessage, fetchTopicMessages, submitTopicMessage } from "../chainz/hederaNetwork";
import {
  hederaBackendConfig,
  isAccountEndpointConfigured,
  isTopicEndpointConfigured,
  requestAccountCreation,
  requestTopicCreation,
} from "../chainz/hederaBackend";
import { generateHederaWallet } from "../chainz/hederaWallet";

const HederaContext = createContext(null);

const DEFAULT_POLL_INTERVAL = 5_000;
const WALLET_STORAGE_KEY = "@hardora/hederaWallet";
const ACCOUNT_STORAGE_KEY = "@hardora/hederaAccount";

const serialiseWallet = (data) => {
  if (!data) {
    return null;
  }
  return JSON.stringify({
    mnemonicWords: data.mnemonicWords,
    mnemonic: data.mnemonic,
    privateKeyHex: data.privateKeyHex,
    publicKeyHex: data.publicKeyHex,
    privateKeyDer: data.privateKeyDer,
    publicKeyDer: data.publicKeyDer,
  });
};

const hydrateWallet = (raw) => {
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw);
  const hydrated = {
    ...parsed,
    mnemonicWords: Array.isArray(parsed.mnemonicWords) ? parsed.mnemonicWords : [],
    mnemonic: parsed.mnemonic ?? "",
    privateKeyHex: parsed.privateKeyHex ?? "",
    publicKeyHex: parsed.publicKeyHex ?? "",
    privateKeyDer: parsed.privateKeyDer ?? "",
    publicKeyDer: parsed.publicKeyDer ?? "",
  };

  try {
    if (hydrated.privateKeyHex) {
      hydrated.privateKeyBytes = Buffer.from(hydrated.privateKeyHex, "hex");
    }
    if (hydrated.publicKeyHex) {
      hydrated.publicKeyBytes = Buffer.from(hydrated.publicKeyHex, "hex");
    }
  } catch (error) {
    console.warn("Unable to hydrate Hedera wallet buffers", error);
  }

  return hydrated;
};

const normaliseMessage = (message) => {
  const decoded = decodeConsensusMessage(message.message);
  const timestamp = message.consensus_timestamp
    ? parseFloat(message.consensus_timestamp) * 1000
    : Date.now();

  return {
    id: `${message.consensus_timestamp || Date.now()}-${message.sequence_number}`,
    sequenceNumber: message.sequence_number,
    consensusTimestamp: message.consensus_timestamp,
    message: decoded,
    runningHash: message.running_hash,
    transactionId: message.chunk_info?.initial_transaction_id,
    receivedAt: new Date(timestamp),
  };
};

export const HederaProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [walletStatus, setWalletStatus] = useState({ loading: false, error: null });
  const [account, setAccount] = useState(null);
  const [accountStatus, setAccountStatus] = useState({ loading: false, error: null });
  const [walletHydrated, setWalletHydrated] = useState(false);

  const [topic, setTopic] = useState(null);
  const [topicStatus, setTopicStatus] = useState({ loading: false, error: null });

  const [messageStatus, setMessageStatus] = useState({ loading: false, error: null });
  const [messages, setMessages] = useState([]);

  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const pollerRef = useRef(null);
  const lastSequenceRef = useRef(null);

  const resetTopicState = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
    lastSequenceRef.current = null;
    setMessages([]);
    setSubscriptionActive(false);
    setTopic(null);
    setTopicStatus({ loading: false, error: null });
    setMessageStatus({ loading: false, error: null });
    setAccount(null);
    setAccountStatus({ loading: false, error: null });
    AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY).catch(() => {});
  }, []);

  const createWallet = useCallback(async () => {
    setWalletStatus({ loading: true, error: null });
    try {
      const keyPair = await generateHederaWallet();
      setWallet(keyPair);
      await AsyncStorage.setItem(WALLET_STORAGE_KEY, serialiseWallet(keyPair));
      await AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY);
      resetTopicState();
      setWalletStatus({ loading: false, error: null });

      if (isAccountEndpointConfigured()) {
        setAccountStatus({ loading: true, error: null });
        try {
          const accountResponse = await requestAccountCreation({
            publicKeyDer: keyPair.publicKeyDer,
            publicKeyHex: keyPair.publicKeyHex,
          });

          setAccount(accountResponse);
          await AsyncStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accountResponse));
          setAccountStatus({ loading: false, error: null });
        } catch (error) {
          setAccount(null);
          await AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY);
          setAccountStatus({
            loading: false,
            error: error.message || "Unable to request Hedera account creation",
          });
        }
      } else {
        setAccount(null);
        await AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY);
        setAccountStatus({ loading: false, error: null });
      }

      return keyPair;
    } catch (error) {
      setWalletStatus({ loading: false, error: error.message || "Unable to create Hedera wallet" });
      throw error;
    }
  }, [resetTopicState]);

  const createTopic = useCallback(
    async ({ memo } = {}) => {
      if (!wallet) {
        throw new Error("Create a wallet before creating a topic");
      }

      setTopicStatus({ loading: true, error: null });
      try {
        const topicMemo = memo || "Hardora Device Stream";
        let created;

        if (isTopicEndpointConfigured()) {
          const response = await requestTopicCreation({
            memo: topicMemo,
            publicKeyDer: wallet.publicKeyDer,
            publicKeyHex: wallet.publicKeyHex,
          });

          const topicId = response?.topicId || response?.topic_id;
          if (!topicId) {
            throw new Error("Topic creation backend did not return a topic ID");
          }

          created = {
            topicId,
            runningHash: response?.runningHash || response?.running_hash || null,
            sequenceNumber: response?.sequenceNumber ?? response?.sequence_number ?? 0,
            raw: response,
          };
        } else {
          created = await createConsensusTopic({ memo: topicMemo });
        }

        setTopic({ ...created, memo: topicMemo });
        lastSequenceRef.current = created.sequenceNumber ?? null;
        setMessages([]);
        setTopicStatus({ loading: false, error: null });
        return created;
      } catch (error) {
        console.log(error, 'error creating topic')
        setTopicStatus({ loading: false, error: error.message || "Unable to create Hedera topic" });
        throw error;
      }
    },
    [wallet]
  );

  const pollTopic = useCallback(async () => {
    if (!topic?.topicId) {
      return;
    }

    try {
      const latestMessages = await fetchTopicMessages(topic.topicId, {
        order: "asc",
        limit: 25,
        sinceSequence: lastSequenceRef.current,
      });

      setTopicStatus((state) => (state.error ? { ...state, error: null } : state));

      if (!latestMessages.length) {
        return;
      }

      const mapped = latestMessages.map(normaliseMessage);
      const tail = mapped[mapped.length - 1];
      lastSequenceRef.current = tail.sequenceNumber;

      setMessages((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const filtered = mapped.filter((item) => !existingIds.has(item.id));
        return filtered.length ? [...prev, ...filtered] : prev;
      });
    } catch (error) {
      setTopicStatus((state) => ({ ...state, error: error.message || "Unable to poll Hedera topic" }));
    }
  }, [topic]);

  const startSubscription = useCallback(async () => {
    if (!topic?.topicId) {
      throw new Error("Create a topic before subscribing to messages");
    }

    setTopicStatus((state) => ({ ...state, error: null }));

    if (pollerRef.current) {
      setSubscriptionActive(true);
      return;
    }

    await pollTopic();
    pollerRef.current = setInterval(pollTopic, DEFAULT_POLL_INTERVAL);
    setSubscriptionActive(true);
  }, [pollTopic, topic]);

  const stopSubscription = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
    setSubscriptionActive(false);
  }, []);

  useEffect(() => () => stopSubscription(), [stopSubscription]);

  useEffect(() => {
    let mounted = true;

    const restorePersistedState = async () => {
      let storedWallet = null;
      let storedAccount = null;

      try {
        [storedWallet, storedAccount] = await Promise.all([
          AsyncStorage.getItem(WALLET_STORAGE_KEY),
          AsyncStorage.getItem(ACCOUNT_STORAGE_KEY),
        ]);
      } catch (error) {
        console.warn("Unable to access Hedera storage", error);
        if (mounted) {
          setWallet(null);
          setAccount(null);
          setWalletStatus({
            loading: false,
            error: error.message || "Unable to load Hedera wallet",
          });
          setAccountStatus((state) =>
            state.loading ? state : { loading: false, error: null }
          );
          setWalletHydrated(true);
        }
        return;
      }

      if (!mounted) {
        return;
      }

      if (storedWallet) {
        try {
          const hydrated = hydrateWallet(storedWallet);
          setWallet(hydrated);
        } catch (error) {
          console.warn("Unable to hydrate Hedera wallet from storage", error);
          setWallet(null);
          AsyncStorage.removeItem(WALLET_STORAGE_KEY).catch(() => {});
        }
      } else {
        setWallet(null);
      }

      setWalletStatus((state) =>
        state.loading ? state : { loading: false, error: null }
      );

      if (storedAccount && storedWallet) {
        try {
          const parsedAccount = JSON.parse(storedAccount);
          setAccount(parsedAccount);
          setAccountStatus((state) =>
            state.loading ? { ...state, error: null } : { loading: false, error: null }
          );
        } catch (error) {
          console.warn("Unable to parse persisted Hedera account", error);
          setAccount(null);
          setAccountStatus((state) =>
            state.loading ? state : { loading: false, error: null }
          );
          AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY).catch(() => {});
        }
      } else {
        if (!storedWallet && storedAccount) {
          AsyncStorage.removeItem(ACCOUNT_STORAGE_KEY).catch(() => {});
        }
        setAccount(null);
        setAccountStatus((state) =>
          state.loading ? state : { loading: false, error: null }
        );
      }
      setWalletHydrated(true);
    };

    restorePersistedState();

    return () => {
      mounted = false;
    };
  }, []);

  const publishMessage = useCallback(
    async (payload) => {
      if (!topic?.topicId) {
        throw new Error("Create a topic before publishing messages");
      }

      setMessageStatus({ loading: true, error: null });
      try {
        const asString =
          typeof payload === "string"
            ? payload
            : JSON.stringify({ timestamp: Date.now(), ...payload });
        const message = Buffer.from(asString, "utf8").toString("base64");
        const response = await submitTopicMessage(topic.topicId, message);
        setMessageStatus({ loading: false, error: null });
        return response;
      } catch (error) {
        setMessageStatus({ loading: false, error: error.message || "Unable to submit Hedera message" });
        throw error;
      }
    },
    [topic]
  );

  const value = useMemo(
    () => ({
      wallet,
      walletStatus,
      topic,
      topicStatus,
      messages,
      messageStatus,
      subscriptionActive,
      account,
      accountStatus,
      walletHydrated,
      hederaBackendConfig,
      createWallet,
      createTopic,
      publishMessage,
      startSubscription,
      stopSubscription,
      resetTopicState,
    }),
    [
      wallet,
      walletStatus,
      topic,
      topicStatus,
      messages,
      messageStatus,
      subscriptionActive,
      account,
      accountStatus,
      walletHydrated,
      hederaBackendConfig,
      createWallet,
      createTopic,
      publishMessage,
      startSubscription,
      stopSubscription,
      resetTopicState,
    ]
  );

  return <HederaContext.Provider value={value}>{children}</HederaContext.Provider>;
};

export const useHedera = () => {
  const context = useContext(HederaContext);
  if (!context) {
    throw new Error("useHedera must be used within a HederaProvider");
  }
  return context;
};
