import { ethers } from "ethers";
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CONTRACTS } from "./contracts";

const ANNOUNCER_ABI = [
  "event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)"
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
