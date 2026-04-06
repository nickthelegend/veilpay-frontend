import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCheckpoint = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    return await ctx.db
      .query("scanCheckpoints")
      .withIndex("by_wallet", q => q.eq("walletAddress", walletAddress))
      .first();
  },
});

export const updateCheckpoint = mutation({
  args: {
    walletAddress: v.string(),
    lastScannedBlock: v.number(),
    totalAnnouncements: v.number(),
    matchedCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scanCheckpoints")
      .withIndex("by_wallet", q => q.eq("walletAddress", args.walletAddress))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
    } else {
      await ctx.db.insert("scanCheckpoints", { ...args, updatedAt: now });
    }
  },
});
