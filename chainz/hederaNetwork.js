import { Buffer } from "buffer";
import Constants from "expo-constants";

const DEFAULT_BASE_URL = "https://testnet.mirrornode.hedera.com/api/v1";

const getExtraConfig = () => {
  const extra =
    Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {}; // manifest is used in Expo Go
  return extra?.hedera ?? {};
};

const resolvedConfig = getExtraConfig();

export const hederaConfig = {
  baseUrl: resolvedConfig.mirrorNodeBaseUrl || DEFAULT_BASE_URL,
  apiKey: resolvedConfig.apiKey || resolvedConfig.api_key || "",
};

const withApiKey = (headers = {}) =>
  hederaConfig.apiKey
    ? { ...headers, "x-api-key": hederaConfig.apiKey }
    : headers;

const buildUrl = (path, query) => {
  const base = hederaConfig.baseUrl.replace(/\/$/, "");
  const url = new URL(`${base}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
};

const request = async (path, { method = "GET", body, query, headers, signal } = {}) => {
  const url = buildUrl(path, query);
  const baseHeaders = withApiKey({ Accept: "application/json" });
  const finalHeaders = {
    ...baseHeaders,
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await response.text();
  console.log(text, 'hedera response text')
  const parseJson = () => {
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error(`Unable to parse Hedera response: ${error.message}`);
    }
  };

  if (!response.ok) {
    const errorPayload = parseJson();
    const message =
      (errorPayload && (errorPayload.message || errorPayload._status?.messages?.[0]?.message)) ||
      `Hedera request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = errorPayload;
    if (response.status === 404 && method === "POST") {
      error.hint =
        "Topic creation and message submission require a Hedera Portal API key. Confirm app.json extra.hedera.apiKey and baseUrl.";
    } else if (response.status === 401 || response.status === 403) {
      error.hint = "Mirror node rejected the request. Verify your API key and permission scope.";
    }
    throw error;
  }

  return parseJson();
};

export const createConsensusTopic = async ({ memo = "Hardora Device Stream", adminKey, submitKey } = {}) => {
  if (!hederaConfig.apiKey) {
    throw new Error(
      "Hedera Mirror Node API key is not configured. Update app.json extra.hedera.apiKey with a valid key from Hedera Portal."
    );
  }

  const payload = { memo };
  if (adminKey) {
    payload.admin_key = adminKey;
  }
  if (submitKey) {
    payload.submit_key = submitKey;
  }

  const result = await request("/topics", { method: "POST", body: payload });

  if (result?.topic_id) {
    return {
      topicId: result.topic_id,
      runningHash: result.running_hash,
      sequenceNumber: result.sequence_number ?? 0,
      raw: result,
    };
  }

  // Some mirror nodes respond with 202 and no payload. In this case, rely on the location header.
  throw new Error("Hedera mirror node did not return a topic identifier. Check API key and permissions.");
};

export const submitTopicMessage = async (topicId, message, options = {}) => {
  if (!topicId) {
    throw new Error("topicId is required to submit a message");
  }

  if (!hederaConfig.apiKey) {
    throw new Error(
      "Hedera Mirror Node API key is not configured. Update app.json extra.hedera.apiKey with a valid key from Hedera Portal."
    );
  }

  if (!message) {
    throw new Error("message payload is empty");
  }

  const payload = { message };
  if (options.chunkInfo) {
    payload.chunk_info = options.chunkInfo;
  }

  return request(`/topics/${topicId}/messages`, { method: "POST", body: payload });
};

export const fetchTopicMessages = async (topicId, { limit = 20, order = "asc", sinceSequence } = {}) => {
  if (!topicId) {
    throw new Error("topicId is required to fetch messages");
  }

  const query = { limit, order };
  if (sinceSequence) {
    query.sequencenumber = `gt:${sinceSequence}`;
  }

  const payload = await request(`/topics/${topicId}/messages`, { query });
  return payload?.messages ?? [];
};

export const decodeConsensusMessage = (message) => {
  if (!message) {
    return { decoded: null, raw: message };
  }

  try {
    const buffer = Buffer.from(message, "base64");
    const text = buffer.toString("utf8");
    try {
      return { decoded: JSON.parse(text), raw: message, text };
    } catch (error) {
      return { decoded: text, raw: message, text };
    }
  } catch (error) {
    return { decoded: null, raw: message, error };
  }
};
