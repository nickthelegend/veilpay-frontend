import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all announcements from a block onwards (for scanning)
export const getAnnouncementsSince = query({
  args: {
    fromBlock: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { fromBlock, limit }) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_block", q => q.gte("blockNumber", fromBlock))
      .order("asc")
      .take(limit ?? 500);
  },
});

// Upsert announcement from chain indexer
export const upsertAnnouncement = mutation({
  args: {
    schemeId: v.number(),
    stealthAddress: v.string(),
    callerAddress: v.string(),
    ephemeralPubKey: v.string(),
    metadata: v.string(),
    tokenAddress: v.optional(v.string()),
    amount: v.string(),
    txHash: v.string(),
    blockNumber: v.number(),
    logIndex: v.number(),
    timestamp: v.number(),
    network: v.string(),
  },
  handler: async (ctx, args) => {
    // Dedup by txHash + logIndex
    const existing = await ctx.db
      .query("announcements")
      .withIndex("by_tx", q => q.eq("txHash", args.txHash).eq("logIndex", args.logIndex))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("announcements", args);
  },
});

export const getLatestBlock = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("announcements")
      .withIndex("by_block")
      .order("desc")
      .first();
    return latest?.blockNumber ?? 0;
  },
});
