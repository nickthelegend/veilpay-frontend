// src/lib/stealth.test.mjs — run with: node src/lib/stealth.test.mjs
import { ethers } from "ethers";

// Copy the exact logic from stealth.ts here for node testing
function generateStealthKeys() {
  const spendingWallet = ethers.Wallet.createRandom();
  const viewingWallet = ethers.Wallet.createRandom();
  const spendingPubKey = spendingWallet.signingKey.compressedPublicKey;
  const viewingPubKey = viewingWallet.signingKey.compressedPublicKey;
  return {
    spendingPrivKey: spendingWallet.privateKey,
    spendingPubKey,
    viewingPrivKey: viewingWallet.privateKey,
    viewingPubKey,
    stealthMetaAddress: spendingPubKey + viewingPubKey.slice(2),
  };
}

function generateStealthAddress(stealthMetaAddress) {
  const metaHex = stealthMetaAddress.replace("0x", "");
  const spendingPubKey = "0x" + metaHex.slice(0, 66);
  const viewingPubKey = "0x" + metaHex.slice(66, 132);
  const ephemeralWallet = ethers.Wallet.createRandom();
  const sharedSecret = ephemeralWallet.signingKey.computeSharedSecret(viewingPubKey);
  const hashedSecret = ethers.keccak256(sharedSecret);
  const stealthWallet = new ethers.Wallet(hashedSecret);
  return {
    stealthAddress: stealthWallet.address,
    ephemeralPubKey: ephemeralWallet.signingKey.compressedPublicKey,
    ephemeralPrivKey: ephemeralWallet.privateKey,
  };
}

function checkAnnouncement(ephemeralPubKey, viewingPrivKey, announcedStealthAddress) {
  try {
    const viewingSigner = new ethers.SigningKey(viewingPrivKey);
    const sharedSecret = viewingSigner.computeSharedSecret(ephemeralPubKey);
    const hashedSecret = ethers.keccak256(sharedSecret);
    const candidateWallet = new ethers.Wallet(hashedSecret);
    if (candidateWallet.address.toLowerCase() === announcedStealthAddress.toLowerCase()) {
      return { matched: true, stealthPrivKey: hashedSecret };
    }
    return { matched: false };
  } catch {
    return { matched: false };
  }
}

// === TESTS ===
let passed = 0; let failed = 0;
function assert(condition, msg) {
  if (condition) { console.log("  ✓", msg); passed++; }
  else { console.error("  ✗ FAIL:", msg); failed++; }
}

console.log("\n--- Test 1: Key generation ---");
const keys = generateStealthKeys();
assert(keys.spendingPubKey.startsWith("0x"), "spendingPubKey is hex");
assert(keys.viewingPubKey.startsWith("0x"), "viewingPubKey is hex");
assert(keys.stealthMetaAddress.length === 134, "stealthMetaAddress is 68+66 = 134 chars (0x + 33 bytes + 33 bytes)");
assert(keys.spendingPrivKey.length === 66, "spendingPrivKey is 32 bytes hex");
assert(keys.viewingPrivKey.length === 66, "viewingPrivKey is 32 bytes hex");

console.log("\n--- Test 2: Stealth address generation ---");
const result = generateStealthAddress(keys.stealthMetaAddress);
assert(ethers.isAddress(result.stealthAddress), "stealthAddress is valid EVM address");
assert(result.ephemeralPubKey.startsWith("0x"), "ephemeralPubKey is hex");
assert(result.ephemeralPrivKey.startsWith("0x"), "ephemeralPrivKey is hex");

console.log("\n--- Test 3: Scan match (should match) ---");
const scan = checkAnnouncement(result.ephemeralPubKey, keys.viewingPrivKey, result.stealthAddress);
assert(scan.matched === true, "Correct viewing key matches");
assert(scan.stealthPrivKey !== undefined, "stealthPrivKey returned on match");

console.log("\n--- Test 4: Scan no-match (wrong key) ---");
const wrongKeys = generateStealthKeys();
const noMatch = checkAnnouncement(result.ephemeralPubKey, wrongKeys.viewingPrivKey, result.stealthAddress);
assert(noMatch.matched === false, "Wrong viewing key does not match");

console.log("\n--- Test 5: Multiple sends, correct scan ---");
for (let i = 0; i < 5; i++) {
  const r = generateStealthAddress(keys.stealthMetaAddress);
  const s = checkAnnouncement(r.ephemeralPubKey, keys.viewingPrivKey, r.stealthAddress);
  assert(s.matched, `Round ${i+1}: scan matches`);
}

console.log("\n--- Test 6: Stealthkey determinism ---");
// Same ephemeralPub + viewingPriv must always derive same stealthAddress
const r1 = { ephemeralPubKey: result.ephemeralPubKey, stealthAddress: result.stealthAddress };
const s1 = checkAnnouncement(r1.ephemeralPubKey, keys.viewingPrivKey, r1.stealthAddress);
const s2 = checkAnnouncement(r1.ephemeralPubKey, keys.viewingPrivKey, r1.stealthAddress);
assert(s1.stealthPrivKey === s2.stealthPrivKey, "Derivation is deterministic");

console.log(`\n=== ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
