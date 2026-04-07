import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";
import { indexAnnouncementsFromBlock, indexDarkPoolEvents } from "../src/lib/indexer";
import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { CONTRACTS } from "../src/lib/contracts";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!;
const convex = new ConvexReactClient(CONVEX_URL);

async function main() {
  console.log("Starting VeilPay Indexer...");
  const provider = new ethers.JsonRpcProvider(CONTRACTS.rpc);
  
  // Starting block — jumped to current range on Conflux eSpace Testnet
  const latestIndexed = Number(await convex.query(api.announcements.getLatestBlock));
  let fromBlock = latestIndexed ? latestIndexed - 10 : 248340000; 

  while (true) {
    try {
      const currentBlock = await provider.getBlockNumber();
      if (fromBlock < currentBlock) {
        console.log(`Indexing from ${fromBlock} to ${currentBlock}...`);
        const result = await indexAnnouncementsFromBlock(convex, fromBlock, currentBlock);
        await indexDarkPoolEvents(convex, fromBlock, currentBlock);
        console.log(`Indexed ${result.indexed} new announcements and checked for dark pool matches.`);
        fromBlock = result.latestBlock + 1;
      }
    } catch (error) {
      console.error("Indexer error:", error);
    }
    // Poll every 10 seconds
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

main().catch(console.error);
