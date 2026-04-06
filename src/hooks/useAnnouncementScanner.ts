"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { checkAnnouncement } from "@/lib/stealth";
import { ethers } from "ethers";

interface ScanResult {
  matched: number;
  scanned: number;
  isScanning: boolean;
  lastScannedBlock: number;
}

export function useAnnouncementScanner(walletAddress: string | undefined) {
  const [scanResult, setScanResult] = useState<ScanResult>({
    matched: 0, scanned: 0, isScanning: false, lastScannedBlock: 0
  });

  const checkpoint = useQuery(
    api.scanning.getCheckpoint,
    walletAddress ? { walletAddress } : "skip"
  );
  
  const updateCheckpoint = useMutation(api.scanning.updateCheckpoint);
  const recordReceived = useMutation(api.payments.recordReceivedPayment);
  const getAnnouncements = useQuery(
    api.announcements.getAnnouncementsSince,
    { fromBlock: checkpoint?.lastScannedBlock ?? 0 }
  );

  const scan = useCallback(async (viewingPrivKey: string, spendingPubKey: string) => {
    if (!walletAddress || !getAnnouncements) return;
    
    setScanResult(prev => ({ ...prev, isScanning: true }));
    let matched = 0;

    for (const announcement of getAnnouncements) {
      const isMatch = checkAnnouncement(
        announcement.ephemeralPubKey,
        viewingPrivKey,
        spendingPubKey,
        announcement.stealthAddress
      );
      
      if (isMatch) {
        const amountFormatted = announcement.tokenAddress
          ? `${ethers.formatUnits(announcement.amount, 18)} TOKEN`
          : `${ethers.formatEther(announcement.amount)} CFX`;
          
        await recordReceived({
          ownerWallet: walletAddress,
          announcementId: announcement._id,
          stealthAddress: announcement.stealthAddress,
          ephemeralPubKey: announcement.ephemeralPubKey,
          tokenAddress: announcement.tokenAddress,
          amount: announcement.amount,
          amountFormatted,
          status: "unspent",
          discoveredAt: Date.now(),
          blockNumber: announcement.blockNumber,
        });
        matched++;
      }
    }

    const latestBlock = getAnnouncements?.[getAnnouncements.length - 1]?.blockNumber ?? checkpoint?.lastScannedBlock ?? 0;

    await updateCheckpoint({
      walletAddress,
      lastScannedBlock: latestBlock,
      totalAnnouncements: (checkpoint?.totalAnnouncements ?? 0) + getAnnouncements.length,
      matchedCount: (checkpoint?.matchedCount ?? 0) + matched,
    });

    setScanResult({
      matched,
      scanned: getAnnouncements.length,
      isScanning: false,
      lastScannedBlock: latestBlock,
    });
  }, [walletAddress, getAnnouncements, checkpoint, updateCheckpoint, recordReceived]);

  return { scan, scanResult, checkpoint };
}
