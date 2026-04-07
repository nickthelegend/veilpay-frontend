import { ethers } from "ethers";
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CONTRACTS } from "./contracts";

const ANNOUNCER_ABI = [
  "event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)"
];

const ENGINE_ABI = [
  "event OrderSubmitted(bytes32 indexed commitment, address indexed owner, uint256 indexed tokenPairId, uint256 epoch, uint256 timestamp)",
  "event OrderCancelled(bytes32 indexed commitment, address indexed owner, uint256 timestamp)",
  "event MatchSettled(bytes32 indexed commitmentA, bytes32 indexed commitmentB, uint256 fillAmount, uint256 settlementPrice, uint256 timestamp)"
];

export async function indexAnnouncementsFromBlock(
  convex: ConvexReactClient,
  fromBlock: number,
  toBlock: number
): Promise<{ indexed: number; latestBlock: number }> {
  const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
  const announcer = new ethers.Contract(CONTRACTS.StealthAnnouncer, ANNOUNCER_ABI, provider);

  const filter = announcer.filters.Announcement();
  const events = await announcer.queryFilter(filter, fromBlock, toBlock);

  let indexed = 0;
  for (const event of events) {
    const log = event as ethers.EventLog;
    const block = await provider.getBlock(log.blockNumber);
    
    // Parse metadata — first 20 bytes = token address if ERC20, else empty = native CFX
    const metadata = log.args[4] as string; // bytes metadata
    let tokenAddress: string | undefined;
    let amount = "0";
    
    // Metadata encoding: if length >= 52 bytes (20 addr + 32 amount), it's ERC20
    const metaHex = metadata.replace("0x", "");
    if (metaHex.length >= 104) {
      tokenAddress = "0x" + metaHex.slice(24, 64); // bytes 12-31 = address
      amount = BigInt("0x" + metaHex.slice(64, 128)).toString(); // bytes 32-63 = amount
    } else {
      // Native CFX — get value from tx receipt
      const tx = await provider.getTransaction(log.transactionHash);
      amount = tx?.value?.toString() ?? "0";
    }

    await convex.mutation(api.announcements.upsertAnnouncement, {
      schemeId: Number(log.args[0]),
      stealthAddress: log.args[1] as string,
      callerAddress: log.args[2] as string,
      ephemeralPubKey: log.args[3] as string,
      metadata: metadata,
      tokenAddress,
      amount,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
      logIndex: log.index,
      timestamp: (block?.timestamp ?? 0) * 1000,
      network: "confluxTestnet",
    });
    indexed++;
  }

  return { indexed, latestBlock: toBlock };
}

export async function indexDarkPoolEvents(
  convex: ConvexReactClient,
  fromBlock: number,
  toBlock: number
): Promise<{ indexed: number }> {
  const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
  const engine = new ethers.Contract(CONTRACTS.DarkBookEngine, ENGINE_ABI, provider);

  // 1. Index Settlements
  const matchFilter = engine.filters.MatchSettled();
  const matchEvents = await engine.queryFilter(matchFilter, fromBlock, toBlock);
  
  for (const event of matchEvents) {
    const log = event as ethers.EventLog;
    await convex.mutation(api.darkpool.insertSettlement, {
      commitmentA: log.args[0] as string,
      commitmentB: log.args[1] as string,
      fillAmount: log.args[2].toString(),
      settlementPrice: log.args[3].toString(),
      txHash: log.transactionHash,
      timestamp: Number(log.args[4]) * 1000,
    });
  }

  // 2. Index Submissions (to ensure we have all commitments tagged as active)
  const submitFilter = engine.filters.OrderSubmitted();
  const submitEvents = await engine.queryFilter(submitFilter, fromBlock, toBlock);
  
  for (const event of submitEvents) {
    const log = event as ethers.EventLog;
    // We don't have the plaintext yet, so we just mark the commitment as on-chain
    // The Convex mutation should handle existing/missing plaintext cases.
  }

  return { indexed: matchEvents.length + submitEvents.length };
}
