import Constants from "expo-constants";

const getExtraConfig = () => {
  const extra =
    Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};
  return extra?.hedera ?? {};
};

const config = getExtraConfig();

const accountEndpoint = config.accountEndpoint || config.accountCreationUrl || config.account_creation_url || "";
const configuredTopicEndpoint = config.topicEndpoint || config.topicCreationUrl || config.topic_creation_url || "";

const deriveTopicEndpointFromAccount = () => {
  if (!accountEndpoint) {
    return "";
  }

  try {
    const url = new URL(accountEndpoint);
    const pathSegments = url.pathname.replace(/\/$/, "").split("/");
    pathSegments.pop();
    pathSegments.push("create-topic");
    url.pathname = pathSegments.join("/") || "/";
    return url.toString();
  } catch (error) {
    const base = accountEndpoint.replace(/\/[^/]*$/, "");
    return `${base}/create-topic`;
  }
};

const topicEndpoint = configuredTopicEndpoint || deriveTopicEndpointFromAccount();

export const hederaBackendConfig = {
  accountEndpoint,
  topicEndpoint,
};

export const isAccountEndpointConfigured = () => Boolean(accountEndpoint);
export const isTopicEndpointConfigured = () => Boolean(topicEndpoint);

export const requestAccountCreation = async ({ publicKeyDer, publicKeyHex, network = "testnet" }) => {
  if (!accountEndpoint) {
    throw new Error("No Hedera account creation endpoint configured");
  }
  console.log(accountEndpoint, 'endpoint account')
  const payload = {};
  if (publicKeyDer) {
    payload.publicKeyDer = publicKeyDer;
    payload.publicKey = publicKeyDer;
  }

  if (publicKeyHex) {
    payload.publicKeyHex = publicKeyHex.replace(/^0x/, "");
    if (!payload.publicKey) {
      payload.publicKey = payload.publicKeyHex;
    }
  }

  if (!payload.publicKeyDer && !payload.publicKeyHex) {
    throw new Error("Public key is required to create an account");
  }

  const response = await fetch(accountEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      network,
    }),
  });

  const _payload = await response.text();
  console.log(payload, 'payload text', _payload)
  const parsePayload = () => {
    if (!_payload) {
      return {};
    }
    try {
      return JSON.parse(_payload);
    } catch (error) {
      throw new Error("Unable to parse Hedera backend response");
    }
  };

  if (!response.ok) {
    const parsed = parsePayload();
    const message = parsed?.message || `Backend returned status ${response.status}`;
    const error = new Error(message);
    error.payload = parsed;
    error.status = response.status;
    throw error;
  }

  return parsePayload();
};

export const requestTopicCreation = async ({
  memo = "Hardora Device Stream",
  publicKeyDer,
  publicKeyHex,
  network = "testnet",
  adminKeyDer,
  submitKeyDer,
}) => {
  if (!topicEndpoint) {
    throw new Error("No Hedera topic creation endpoint configured");
  }

  const payload = {
    memo,
    network,
  };

  if (publicKeyDer) {
    payload.publicKeyDer = publicKeyDer;
    payload.publicKey = publicKeyDer;
  }
  if (publicKeyHex) {
    payload.publicKeyHex = publicKeyHex.replace(/^0x/, "");
    if (!payload.publicKey) {
      payload.publicKey = payload.publicKeyHex;
    }
  }
  if (adminKeyDer) {
    payload.adminKeyDer = adminKeyDer;
  }
  if (submitKeyDer) {
    payload.submitKeyDer = submitKeyDer;
  }

  const response = await fetch(topicEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  const parsePayload = () => {
    if (!text) {
      return {};
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error("Unable to parse Hedera topic backend response");
    }
  };

  if (!response.ok) {
    const parsed = parsePayload();
    const message = parsed?.message || `Backend returned status ${response.status}`;
    const error = new Error(message);
    error.payload = parsed;
    error.status = response.status;
    throw error;
  }

  return parsePayload();
};
