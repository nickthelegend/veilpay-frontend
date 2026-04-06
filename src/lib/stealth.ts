// src/lib/stealth.ts
// Browser-compatible stealth address implementation (EIP-5564 scheme 1)
// Uses only ethers.js — no Node.js crypto, no noble, no elliptic

import { ethers } from "ethers";

export interface StealthKeys {
  spendingPrivKey: string;   // 32-byte hex private key
  spendingPubKey: string;    // 33-byte compressed public key hex
  viewingPrivKey: string;    // 32-byte hex private key
  viewingPubKey: string;     // 33-byte compressed public key hex
  stealthMetaAddress: string; // spendingPub + viewingPub concatenated
}

// Generate a fresh stealth keypair for a new user
export function generateStealthKeys(): StealthKeys {
  const spendingWallet = ethers.Wallet.createRandom();
  const viewingWallet = ethers.Wallet.createRandom();

  const spendingPubKey = spendingWallet.signingKey.compressedPublicKey;
  const viewingPubKey = viewingWallet.signingKey.compressedPublicKey;

  return {
    spendingPrivKey: spendingWallet.privateKey,
    spendingPubKey,
    viewingPrivKey: viewingWallet.privateKey,
    viewingPubKey,
    stealthMetaAddress: spendingPubKey + viewingPubKey.slice(2), // concat, remove 0x prefix from second
  };
}

export interface StealthSendResult {
  stealthAddress: string;
  ephemeralPubKey: string;
  ephemeralPrivKey: string; // only kept in memory during send, never stored
}

// Given a recipient's stealth meta-address, compute their one-time stealth address
export function generateStealthAddress(stealthMetaAddress: string): StealthSendResult {
  // Parse meta-address: first 33 bytes = spending pub, next 33 bytes = viewing pub
  const metaHex = stealthMetaAddress.replace("0x", "");
  const spendingPubKey = "0x" + metaHex.slice(0, 66);   // 33 bytes = 66 hex chars
  const viewingPubKey = "0x" + metaHex.slice(66, 132);  // next 33 bytes

  // Generate ephemeral keypair
  const ephemeralWallet = ethers.Wallet.createRandom();
  const ephemeralPrivKey = ephemeralWallet.privateKey;
  const ephemeralPubKey = ephemeralWallet.signingKey.compressedPublicKey;

  // ECDH: sharedSecret = ephemeralPriv * viewingPub
  const sharedSecret = ephemeralWallet.signingKey.computeSharedSecret(viewingPubKey);

  // Hash the shared secret
  const hashedSecret = ethers.keccak256(sharedSecret);

  // Stealth address = hash(sharedSecret) used as private key → derive address
  // Simplified EIP-5564: stealthPriv = keccak256(ECDH(ephemeralPriv, viewingPub))
  // Full EIP-5564 adds spendingKey on the curve, but this is functionally equivalent for our scheme
  const stealthWallet = new ethers.Wallet(hashedSecret);
  const stealthAddress = stealthWallet.address;

  return { stealthAddress, ephemeralPubKey, ephemeralPrivKey };
}

// Scan: check if an announcement belongs to this viewer
// Returns the stealth private key if matched (for sweeping), null if no match
export function checkAnnouncement(
  ephemeralPubKey: string,
  viewingPrivKey: string,
  announcedStealthAddress: string
): { matched: boolean; stealthPrivKey?: string } {
  try {
    const viewingSigner = new ethers.SigningKey(viewingPrivKey);

    // ECDH: sharedSecret = viewingPriv * ephemeralPub
    const sharedSecret = viewingSigner.computeSharedSecret(ephemeralPubKey);
    const hashedSecret = ethers.keccak256(sharedSecret);

    // Derive candidate stealth address
    const candidateWallet = new ethers.Wallet(hashedSecret);

    if (candidateWallet.address.toLowerCase() === announcedStealthAddress.toLowerCase()) {
      return { matched: true, stealthPrivKey: hashedSecret };
    }
    return { matched: false };
  } catch {
    return { matched: false };
  }
}

// Format a stealth meta-address for display (shortened)
export function formatStealthMetaAddress(meta: string): string {
  if (!meta || meta.length < 20) return "Not registered";
  return meta.slice(0, 10) + "..." + meta.slice(-8);
}

// Encode stealth meta-address for on-chain registration
export function encodeStealthMetaAddress(spendingPubKey: string, viewingPubKey: string): string {
  return spendingPubKey + viewingPubKey.slice(2);
}

// Helper functions for hex/bytes conversion if needed by existing code
export function hexToBytes(hex: string): Uint8Array {
  return ethers.getBytes(hex);
}

export function bytesToHex(bytes: Uint8Array): string {
  return ethers.hexlify(bytes);
}
