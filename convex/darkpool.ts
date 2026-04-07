import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ----- Vault Management -----

export const getVaultBalance = query({
  args: { walletAddress: v.string(), tokenAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vaultBalances")
      .withIndex("by_wallet_token", (q) =>
        q.eq("walletAddress", args.walletAddress).eq("tokenAddress", args.tokenAddress)
      )
      .unique();
  },
});

export const updateVaultBalance = mutation({
  args: {
    walletAddress: v.string(),
    tokenAddress: v.string(),
    newBalance: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vaultBalances")
      .withIndex("by_wallet_token", (q) =>
        q.eq("walletAddress", args.walletAddress).eq("tokenAddress", args.tokenAddress)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        balance: args.newBalance,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("vaultBalances", {
        walletAddress: args.walletAddress,
        tokenAddress: args.tokenAddress,
        balance: args.newBalance,
        pendingDeposit: "0",
        lastUpdated: Date.now(),
      });
    }
  },
});

// ----- Order Management -----

export const submitOrder = mutation({
  args: {
    owner: v.string(),
    commitment: v.string(),
    tokenPairId: v.number(),
    side: v.union(v.literal("buy"), v.literal("sell")),
    amount: v.string(),
    price: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("darkOrders", {
      ...args,
      status: "pending",
      remainingAmount: args.amount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateOrderStatus = mutation({
  args: {
    commitment: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("partially_filled"),
      v.literal("filled"),
      v.literal("cancelled")
    ),
    remainingAmount: v.optional(v.string()),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("darkOrders")
      .withIndex("by_commitment", (q) => q.eq("commitment", args.commitment))
      .unique();

    if (order) {
      const updates: any = { status: args.status, updatedAt: Date.now() };
      if (args.remainingAmount) updates.remainingAmount = args.remainingAmount;
      if (args.txHash) updates.txHash = args.txHash;
      await ctx.db.patch(order._id, updates);
    }
  },
});

export const getUserOrders = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("darkOrders")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .order("desc")
      .collect();
  },
});

// ----- Settlement Indexing -----

export const insertSettlement = mutation({
  args: {
    commitmentA: v.string(),
    commitmentB: v.string(),
    fillAmount: v.string(),
    settlementPrice: v.string(),
    txHash: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Check if already exists
    const existing = await ctx.db
      .query("darkPoolSettlements")
      .withIndex("by_commitment_a", (q) => q.eq("commitmentA", args.commitmentA))
      .filter((q) => q.eq(q.field("commitmentB"), args.commitmentB))
      .unique();

    if (!existing) {
      await ctx.db.insert("darkPoolSettlements", {
        ...args,
        blockNumber: 0, // Placeholder as indexer might not provide it yet
      });

      // 2. Update order statuses to "filled"
      const orders = await Promise.all([
        ctx.db.query("darkOrders").withIndex("by_commitment", q => q.eq("commitment", args.commitmentA)).unique(),
        ctx.db.query("darkOrders").withIndex("by_commitment", q => q.eq("commitment", args.commitmentB)).unique(),
      ]);

      for (const order of orders) {
        if (order) {
          await ctx.db.patch(order._id, { status: "filled", updatedAt: Date.now() });
        }
      }
    }
  },
});

export const getRecentSettlements = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("darkPoolSettlements")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit);
  },
});
// ----- Global Statistics -----

export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    const settlements = await ctx.db.query("darkPoolSettlements").collect();
    const orders = await ctx.db
      .query("darkOrders")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "partially_filled")
        )
      )
      .collect();

    // Calculate Total Volume
    let totalVolumeWei = BigInt(0);
    for (const s of settlements) {
      totalVolumeWei += BigInt(s.fillAmount);
    }

    // Convert to human readable (approx 18 decimals)
    const totalVolume = Number(totalVolumeWei) / 1e18;

    // Calculate "Active Nodes" (Unique participating wallets)
    const uniqueOwners = new Set(orders.map((o) => o.owner));
    const activeNodes = uniqueOwners.size;

    return {
      totalVolume,
      activeNodes,
    };
  },
});
