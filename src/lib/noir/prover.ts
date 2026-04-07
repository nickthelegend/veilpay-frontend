import { ethers } from "ethers";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";

/**
 * ZK Prover Service for the frontend.
 * Handles order commitment generation and (simulated) ZK proof creation.
 */

const HKDF_INFO = new TextEncoder().encode("darkbook-order-encryption-v1");
const HKDF_SALT = new TextEncoder().encode("darkbook-ecdh-salt");

export interface OrderCommitment {
  commitment: string; // bytes32 hex
  nullifier: string;  // bytes32 hex
  price: bigint;
  amount: bigint;
  side: 0 | 1;        // 0 = buy, 1 = sell
  salt: string;       // bytes32 hex
}

export class DarkPoolProver {
  /**
   * Generates a new order commitment
   */
  static generateCommitment(
    price: number | bigint,
    amount: number | bigint,
    side: 0 | 1
  ): OrderCommitment {
    const salt = ethers.hexlify(ethers.randomBytes(32));
    const priceBI = BigInt(price);
    const amountBI = BigInt(amount);
    
    const commitment = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256", "uint256", "uint256", "bytes32"],
        [priceBI, amountBI, BigInt(side), salt]
      )
    );

    const nullifier = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "uint256"],
        [commitment, Date.now()]
      )
    );

    return {
      commitment,
      nullifier,
      price: priceBI,
      amount: amountBI,
      side,
      salt,
    };
  }

  /**
   * Encrypts order details for the matcher.
   * Uses WebCrypto for AES-GCM (browser-native).
   */
  static async encryptForMatcher(
    order: OrderCommitment,
    matcherPublicKeyHex: string,
    senderAddress: string
  ) {
    // 1. Generate ephemeral keypair for this relay
    const ephemeralPriv = crypto.getRandomValues(new Uint8Array(32));
    const matcherPubKey = ethers.getBytes(matcherPublicKeyHex.startsWith("0x") ? matcherPublicKeyHex : `0x${matcherPublicKeyHex}`);

    // 2. Derive shared secret via ECDH
    const sharedPoint = secp256k1.getSharedSecret(ephemeralPriv, matcherPubKey);
    const sharedKey = hkdf(sha256, sharedPoint.slice(1), HKDF_SALT, HKDF_INFO, 32);

    // 3. Serialize payload
    const payload = JSON.stringify({
      price: order.price.toString(),
      amount: order.amount.toString(),
      side: order.side,
      salt: BigInt(order.salt).toString(),
      tokenPairId: 1,
    });

    const plaintext = new TextEncoder().encode(payload);

    // 4. Encrypt with AES-GCM via WebCrypto
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      sharedKey,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      cryptoKey,
      plaintext
    );

    return {
      ciphertext: Array.from(new Uint8Array(ciphertext)),
      nonce: Array.from(nonce),
      ephemeralPubKey: Array.from(secp256k1.getPublicKey(ephemeralPriv, true)),
      commitment: order.commitment,
      sender: senderAddress,
    };
  }

  /**
   * Generates an UltraPlonk proof for order submission.
   */
  static async generateOrderProof(
    order: OrderCommitment,
    balanceRoot: string,
    tokenPairId: number
  ): Promise<string> {
    console.log("[Prover] Generating ZK proof for order:", order.commitment);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return "0x" + "01".repeat(32);
  }
}
