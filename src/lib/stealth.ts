import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { randomBytes } from '@noble/hashes/utils';

const G = secp256k1.ProjectivePoint.BASE;
const n = secp256k1.CURVE.n;

export interface DerivedAddress {
  address: `0x${string}`;
  pubkey: Uint8Array;
  ephemeralPubkey: Uint8Array;
  viewTag: number;
}

export interface ScanResult {
  address: `0x${string}`;
  pubkey: Uint8Array;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) | BigInt(byte);
  }
  return result;
}

function bigIntToBytes(value: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function pubkeyToAddress(compressedPubkey: Uint8Array): `0x${string}` {
  const uncompressed = secp256k1.ProjectivePoint.fromHex(compressedPubkey).toRawBytes(false);
  const hash = keccak_256(uncompressed.slice(1));
  return `0x${bytesToHex(hash.slice(-20))}` as `0x${string}`;
}

// Generate an ephemeral key with even-y parity (EIP-5564)
function generateEphemeralKeyPair(): { secret: Uint8Array; pubkey: Uint8Array } {
  let secret = randomBytes(32);
  const point = secp256k1.ProjectivePoint.fromPrivateKey(secret);
  const compressed = point.toRawBytes(true);
  if (compressed[0] === 0x03) {
    const negated = n - bytesToBigInt(secret);
    secret = bigIntToBytes(negated, 32);
  }
  return { secret, pubkey: secp256k1.getPublicKey(secret, true) };
}

function computeSharedHash(ecdh: Uint8Array): Uint8Array {
  return keccak_256(ecdh);
}

export function computeViewTag(hash: Uint8Array): number {
  return hash[0];
}

/**
 * Derives a stealth address from the recipient's public keys.
 * logic follows EIP-5564.
 */
export function deriveStealthAddress(
  spendingPubkey: Uint8Array,
  viewingPubkey: Uint8Array
): DerivedAddress {
  const { secret: r, pubkey: R } = generateEphemeralKeyPair();

  const ecdh = secp256k1.getSharedSecret(r, viewingPubkey);
  const hash = computeSharedHash(ecdh);
  const viewTag = computeViewTag(hash);

  const hashScalar = bytesToBigInt(hash) % n;
  const S = secp256k1.ProjectivePoint.fromHex(spendingPubkey);
  const stealthPoint = S.add(G.multiply(hashScalar));
  const stealthPubkey = stealthPoint.toRawBytes(true);

  const address = pubkeyToAddress(stealthPubkey);

  return { address, pubkey: stealthPubkey, ephemeralPubkey: R, viewTag };
}

/**
 * Scans an announcement to see if it belongs to the recipient.
 */
export function scanAnnouncement(
  viewingSecret: Uint8Array,
  spendingPubkey: Uint8Array,
  ephemeralPubkey: Uint8Array,
  viewTag: number
): ScanResult | null {
  const ecdh = secp256k1.getSharedSecret(viewingSecret, ephemeralPubkey);
  const hash = computeSharedHash(ecdh);

  if (computeViewTag(hash) !== viewTag) {
    return null;
  }

  const hashScalar = bytesToBigInt(hash) % n;
  const S = secp256k1.ProjectivePoint.fromHex(spendingPubkey);
  const stealthPoint = S.add(G.multiply(hashScalar));
  const stealthPubkey = stealthPoint.toRawBytes(true);

  const address = pubkeyToAddress(stealthPubkey);

  return { address, pubkey: stealthPubkey };
}

/**
 * Derives the private spending key for a stealth address.
 */
export function deriveSpendingKey(
  spendingSecret: Uint8Array,
  viewingSecret: Uint8Array,
  ephemeralPubkey: Uint8Array
): Uint8Array {
  const ecdh = secp256k1.getSharedSecret(viewingSecret, ephemeralPubkey);
  const hash = computeSharedHash(ecdh);

  const s = bytesToBigInt(spendingSecret);
  const hashScalar = bytesToBigInt(hash) % n;
  const derived = (s + hashScalar) % n;

  return bigIntToBytes(derived, 32);
}
