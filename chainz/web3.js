const crypto = require("crypto");

const PRIVATE_KEY_DER_PREFIX = "302e020100300506032b657004220420";
const PUBLIC_KEY_DER_PREFIX = "302a300506032b6570032100";

const toHex = (bytes) => Buffer.from(bytes).toString("hex");

function generateHederaKeyPair() {
  const seed = crypto.randomBytes(32);
  const nacl = require("tweetnacl");
  const naclPair = nacl.sign.keyPair.fromSeed(seed);

  const privateKeyHex = toHex(seed);
  const publicKeyHex = toHex(naclPair.publicKey);

  return {
    privateKeyHex,
    publicKeyHex,
    privateKeyDer: `${PRIVATE_KEY_DER_PREFIX}${privateKeyHex}`,
    publicKeyDer: `${PUBLIC_KEY_DER_PREFIX}${publicKeyHex}`,
  };
}

module.exports = {
  generateHederaKeyPair,
  PRIVATE_KEY_DER_PREFIX,
  PUBLIC_KEY_DER_PREFIX,
};

if (require.main === module) {
  const keys = generateHederaKeyPair();
  console.log("Hedera wallet generated:");
  console.log(`- public key (DER): ${keys.publicKeyDer}`);
  console.log(`- private key (DER): ${keys.privateKeyDer}`);
  console.log("Store the private key securely.");
}
