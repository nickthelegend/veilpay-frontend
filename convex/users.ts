import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getProfile = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    return await ctx.db
      .query("userProfiles")
      .withIndex("by_wallet", q => q.eq("walletAddress", walletAddress))
      .first();
  },
});

export const upsertProfile = mutation({
  args: {
    walletAddress: v.string(),
    spendingPubKey: v.optional(v.string()),
    viewingPubKey: v.optional(v.string()),
    isRegistered: v.boolean(),
    registrationTxHash: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_wallet", q => q.eq("walletAddress", args.walletAddress))
      .first();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("userProfiles", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getStealthMetaAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const reg = await ctx.db
      .query("stealthRegistrations")
      .withIndex("by_wallet", q => q.eq("walletAddress", walletAddress))
      .first();
    return reg?.stealthMetaAddress ?? null;
  },
});

export const recordRegistration = mutation({
  args: {
    walletAddress: v.string(),
    spendingPubKey: v.string(),
    viewingPubKey: v.string(),
    stealthMetaAddress: v.string(),
    txHash: v.string(),
    blockNumber: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("stealthRegistrations", {
      ...args,
      registeredAt: Date.now(),
    });
  },
});
