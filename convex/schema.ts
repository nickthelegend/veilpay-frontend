import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // Registered stealth meta-addresses on-chain
  // Written when user calls StealthRegistry.registerStealthMetaAddress()
  stealthRegistrations: defineTable({
    walletAddress: v.string(),        // EOA address that registered (checksummed)
    spendingPubKey: v.string(),       // 33-byte compressed spending public key (hex)
    viewingPubKey: v.string(),        // 33-byte compressed viewing public key (hex)
    stealthMetaAddress: v.string(),   // encoded meta-address = spendingPub + viewingPub
    txHash: v.string(),               // on-chain registration tx hash
    blockNumber: v.number(),          // block it was included in
    registeredAt: v.number(),         // unix ms
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_stealth_meta_address", ["stealthMetaAddress"]),

  // On-chain Announcement events emitted by StealthAnnouncer
  // Indexed from chain — these are the raw announcements anyone can see
  announcements: defineTable({
    schemeId: v.number(),             // always 1 for our ECDH scheme
    stealthAddress: v.string(),       // the one-time address tokens were sent to
    callerAddress: v.string(),        // who called sendNative/sendERC20 (sender's EOA)
    ephemeralPubKey: v.string(),      // ephemeral public key for ECDH shared secret
    metadata: v.string(),             // hex metadata (token address + amount encoding)
    tokenAddress: v.optional(v.string()),  // null = native CFX, else ERC20 contract addr
    amount: v.string(),               // amount in wei (string to avoid precision loss)
    txHash: v.string(),               // announcement tx hash
    blockNumber: v.number(),
    logIndex: v.number(),             // for deduplication
    timestamp: v.number(),            // unix ms (from block)
    network: v.string(),              // "confluxTestnet"
  })
    .index("by_stealth_address", ["stealthAddress"])
    .index("by_caller", ["callerAddress"])
    .index("by_block", ["blockNumber"])
    .index("by_tx", ["txHash", "logIndex"]),

  // Per-user private inbox — announcements this user's viewing key matched
  // NEVER stored on-chain. Only in Convex, only accessible by that wallet.
  // The stealth private key is NEVER stored — user derives it client-side.
  receivedPayments: defineTable({
    ownerWallet: v.string(),          // the wallet that scanned and found this
    announcementId: v.id("announcements"), // ref to the raw announcement
    stealthAddress: v.string(),       // the one-time address (matches announcement)
    ephemeralPubKey: v.string(),      // copied from announcement for easy access
    tokenAddress: v.optional(v.string()),
    amount: v.string(),               // in wei
    amountFormatted: v.string(),      // human-readable e.g. "1.5 CFX"
    status: v.union(
      v.literal("unspent"),           // funds still at stealth address
      v.literal("spent"),             // user has swept the funds
      v.literal("pending_sweep"),     // sweep tx submitted, not confirmed
    ),
    sweepTxHash: v.optional(v.string()),   // if swept, the withdrawal tx
    discoveredAt: v.number(),         // when the scan found this
    blockNumber: v.number(),
  })
    .index("by_owner", ["ownerWallet"])
    .index("by_owner_status", ["ownerWallet", "status"])
    .index("by_stealth_address", ["stealthAddress"]),

  // Outgoing payments sent by this user
  // Written client-side after successful sendNative/sendERC20 tx
  sentPayments: defineTable({
    senderWallet: v.string(),         // sender's EOA
    recipientStealthMetaAddress: v.string(), // recipient's registered meta-address
    computedStealthAddress: v.string(),      // the one-time address we sent to
    ephemeralPubKey: v.string(),             // ephemeral pubkey we used
    tokenAddress: v.optional(v.string()),    // null = CFX native
    amount: v.string(),              // in wei
    amountFormatted: v.string(),     // human-readable
    txHash: v.string(),              // on-chain tx hash
    status: v.union(
      v.literal("pending"),          // tx submitted
      v.literal("confirmed"),        // tx mined
      v.literal("failed"),           // tx reverted
    ),
    blockNumber: v.optional(v.number()),
    sentAt: v.number(),              // unix ms
    confirmedAt: v.optional(v.number()),
    network: v.string(),
  })
    .index("by_sender", ["senderWallet"])
    .index("by_sender_status", ["senderWallet", "status"])
    .index("by_tx", ["txHash"]),

  // Announcement scan checkpoints — tracks how far we've scanned the chain
  // Prevents re-scanning from genesis every time
  scanCheckpoints: defineTable({
    walletAddress: v.string(),       // whose checkpoint
    lastScannedBlock: v.number(),    // highest block scanned so far
    totalAnnouncements: v.number(),  // total announcements seen
    matchedCount: v.number(),        // how many matched this wallet
    updatedAt: v.number(),
  })
    .index("by_wallet", ["walletAddress"]),

  // User preferences & stealth key metadata
  // The actual private keys are NEVER stored here — only pubkeys and UX prefs
  userProfiles: defineTable({
    walletAddress: v.string(),
    displayName: v.optional(v.string()),
    spendingPubKey: v.optional(v.string()),    // stored after first registration
    viewingPubKey: v.optional(v.string()),
    isRegistered: v.boolean(),                 // has called StealthRegistry on-chain
    registrationTxHash: v.optional(v.string()),
    preferredToken: v.optional(v.string()),    // default token for send flow
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_wallet", ["walletAddress"]),
  
  // DARK POOL TABLES
  
  // Tracks user balances within the ZK Dark Pool vault
  vaultBalances: defineTable({
    walletAddress: v.string(),        // EOA owner
    tokenAddress: v.string(),         // ERC20 contract address
    balance: v.string(),              // current balance in wei
    pendingDeposit: v.string(),       // optional: amount currently being deposited
    lastUpdated: v.number(),
  })
    .index("by_wallet", ["walletAddress"])
    .index("by_wallet_token", ["walletAddress", "tokenAddress"]),

  // Private orders submitted to the dark pool
  darkOrders: defineTable({
    owner: v.string(),                // owner wallet
    commitment: v.string(),           // ZK commitment hash
    tokenPairId: v.number(),          // trading pair
    side: v.union(v.literal("buy"), v.literal("sell")),
    amount: v.string(),               // original amount
    price: v.string(),                // limit price
    status: v.union(
      v.literal("pending"),           // proof being generated / tx submitted
      v.literal("active"),            // registered on-chain, waiting for match
      v.literal("partially_filled"),  // matched but has remainder
      v.literal("filled"),            // completed
      v.literal("cancelled"),         // removed by user
    ),
    remainingAmount: v.string(),      // amount left to fill
    txHash: v.optional(v.string()),   // on-chain submission tx
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_owner", ["owner"])
    .index("by_commitment", ["commitment"])
    .index("by_status", ["status"]),

  // Settlement events indexed from the DarkBookEngine
  darkPoolSettlements: defineTable({
    commitmentA: v.string(),          // buyer commitment
    commitmentB: v.string(),          // seller commitment
    fillAmount: v.string(),           // amount filled in this match
    settlementPrice: v.string(),      // price of the transaction
    txHash: v.string(),               // settlement tx hash
    blockNumber: v.number(),
    timestamp: v.number(),
  })
    .index("by_commitment_a", ["commitmentA"])
    .index("by_commitment_b", ["commitmentB"])
    .index("by_timestamp", ["timestamp"]),

});
