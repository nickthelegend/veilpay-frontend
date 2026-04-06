import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get received payments for a wallet
export const getReceivedPayments = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    return await ctx.db
      .query("receivedPayments")
      .withIndex("by_owner", q => q.eq("ownerWallet", walletAddress))
      .order("desc")
      .collect();
  },
});

// Get sent payments for a wallet
export const getSentPayments = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    return await ctx.db
      .query("sentPayments")
      .withIndex("by_sender", q => q.eq("senderWallet", walletAddress))
      .order("desc")
      .collect();
  },
});

// Dashboard: both sent + received, merged and sorted
export const getPaymentHistory = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const [sent, received] = await Promise.all([
      ctx.db.query("sentPayments")
        .withIndex("by_sender", q => q.eq("senderWallet", walletAddress))
        .order("desc").take(50),
      ctx.db.query("receivedPayments")
        .withIndex("by_owner", q => q.eq("ownerWallet", walletAddress))
        .order("desc").take(50),
    ]);

    const sentMapped = sent.map(p => ({ ...p, direction: "sent" as const }));
    const receivedMapped = received.map(p => ({ ...p, direction: "received" as const }));
    
    return [...sentMapped, ...receivedMapped]
      .sort((a, b) => {
        const aTime = "sentAt" in a ? (a as any).sentAt : (b as any).discoveredAt;
        const bTime = "sentAt" in b ? (b as any).sentAt : (b as any).discoveredAt;
        return bTime - aTime;
      })
      .slice(0, 50);
  },
});

// Record a sent payment (called after tx confirmed)
export const recordSentPayment = mutation({
  args: {
    senderWallet: v.string(),
    recipientStealthMetaAddress: v.string(),
    computedStealthAddress: v.string(),
    ephemeralPubKey: v.string(),
    tokenAddress: v.optional(v.string()),
    amount: v.string(),
    amountFormatted: v.string(),
    txHash: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("failed")),
    sentAt: v.number(),
    network: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sentPayments", args);
  },
});

// Update sent payment status after confirmation
export const updateSentPaymentStatus = mutation({
  args: {
    txHash: v.string(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("failed")),
    blockNumber: v.optional(v.number()),
    confirmedAt: v.optional(v.number()),
  },
  handler: async (ctx, { txHash, status, blockNumber, confirmedAt }) => {
    const payment = await ctx.db
      .query("sentPayments")
      .withIndex("by_tx", q => q.eq("txHash", txHash))
      .first();
    if (!payment) return null;
    await ctx.db.patch(payment._id, { status, blockNumber, confirmedAt });
    return payment._id;
  },
});

// Record a received payment discovered during scanning
export const recordReceivedPayment = mutation({
  args: {
    ownerWallet: v.string(),
    announcementId: v.id("announcements"),
    stealthAddress: v.string(),
    ephemeralPubKey: v.string(),
    tokenAddress: v.optional(v.string()),
    amount: v.string(),
    amountFormatted: v.string(),
    status: v.literal("unspent"),
    discoveredAt: v.number(),
    blockNumber: v.number(),
  },
  handler: async (ctx, args) => {
    // Dedup — don't double-insert if already found
    const existing = await ctx.db
      .query("receivedPayments")
      .withIndex("by_stealth_address", q => q.eq("stealthAddress", args.stealthAddress))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("receivedPayments", args);
  },
});

// Mark a received payment as swept
export const markPaymentSwept = mutation({
  args: {
    stealthAddress: v.string(),
    sweepTxHash: v.string(),
  },
  handler: async (ctx, { stealthAddress, sweepTxHash }) => {
    const payment = await ctx.db
      .query("receivedPayments")
      .withIndex("by_stealth_address", q => q.eq("stealthAddress", stealthAddress))
      .first();
    if (!payment) return null;
    await ctx.db.patch(payment._id, { status: "pending_sweep", sweepTxHash });
    return payment._id;
  },
});
