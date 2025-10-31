import "react-native-get-random-values";
import { Buffer } from "buffer";
import { generateMnemonic as scureGenerateMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist as englishWordlist } from "@scure/bip39/wordlists/english.js";
import nacl from "tweetnacl";

const PRIVATE_KEY_DER_PREFIX = "302e020100300506032b657004220420";
const PUBLIC_KEY_DER_PREFIX = "302a300506032b6570032100";

const DEFAULT_WORD_COUNT = 12;

const WORD_COUNT_TO_STRENGTH = {
  12: 128,
  15: 160,
  18: 192,
  21: 224,
  24: 256,
};

const rawWordlist = englishWordlist;
const wordlist = Array.isArray(rawWordlist)
  ? rawWordlist
  : String(rawWordlist || "")
      .trim()
      .split(/\s+/);

if (!Array.isArray(wordlist) || wordlist.length !== 2048) {
  throw new Error("Invalid English BIP39 wordlist import");
}

const toHex = (bytes) => Buffer.from(bytes).toString("hex");

const normaliseWordCount = (count) => {
  const supported = WORD_COUNT_TO_STRENGTH[count];
  if (!supported) {
    return DEFAULT_WORD_COUNT;
  }
  return count;
};

const resolveStrength = (wordCount) =>
  WORD_COUNT_TO_STRENGTH[normaliseWordCount(wordCount)] ?? WORD_COUNT_TO_STRENGTH[DEFAULT_WORD_COUNT];

export const generateMnemonicWords = async (wordCount = DEFAULT_WORD_COUNT) => {
  const strength = resolveStrength(wordCount);
  const phrase = scureGenerateMnemonic(wordlist, strength);
  return phrase.trim().split(/\s+/);
};

export const deriveKeyPairFromMnemonic = async (words, password = "") => {
  const mnemonic = Array.isArray(words) ? words.join(" ") : String(words || "").trim();
  if (!mnemonic) {
    throw new Error("Mnemonic words are required");
  }

  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error("Invalid mnemonic phrase");
  }

  const seed = mnemonicToSeedSync(mnemonic, password);
  const privateKeySeed = Uint8Array.from(seed.slice(0, 32));
  const keyPair = nacl.sign.keyPair.fromSeed(privateKeySeed);

  const privateKeyBytes = Buffer.from(keyPair.secretKey.slice(0, 32));
  const publicKeyBytes = Buffer.from(keyPair.publicKey);

  return {
    privateKeyBytes,
    publicKeyBytes,
    privateKeyHex: toHex(privateKeyBytes),
    publicKeyHex: toHex(publicKeyBytes),
    privateKeyDer: `${PRIVATE_KEY_DER_PREFIX}${toHex(privateKeyBytes)}`,
    publicKeyDer: `${PUBLIC_KEY_DER_PREFIX}${toHex(publicKeyBytes)}`,
  };
};

export const generateHederaWallet = async ({ wordCount = DEFAULT_WORD_COUNT, password = "" } = {}) => {
  const words = await generateMnemonicWords(wordCount);
  const keyMaterial = await deriveKeyPairFromMnemonic(words, password);

  return {
    mnemonicWords: words,
    mnemonic: words.join(" "),
    ...keyMaterial,
  };
};

export const truncateKey = (value, opts = {}) => {
  const { visible = 6 } = opts;
  if (!value || value.length <= visible * 2) {
    return value;
  }
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};
