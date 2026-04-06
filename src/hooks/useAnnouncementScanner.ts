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
  const [scanResult, setScanResult] = useState<ScanResult & { matchedPayments: any[] }>({
    matched: 0, scanned: 0, isScanning: false, lastScannedBlock: 0, matchedPayments: []
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

  const scan = useCallback(async (
    viewingPrivKey: string, 
    spendingPubKey: string,
    onProgress?: (current: number, total: number) => void
  ) => {
    if (!walletAddress || !getAnnouncements) return;
    
    setScanResult(prev => ({ ...prev, isScanning: true }));
    let matched = 0;
    const matchedPayments: any[] = [];
    const total = getAnnouncements.length;

    for (let i = 0; i < total; i++) {
      const announcement = getAnnouncements[i];
      if (onProgress) onProgress(i + 1, total);
      const { matched: isMatch } = checkAnnouncement(
        announcement.ephemeralPubKey,
        viewingPrivKey,
        announcement.stealthAddress
      );
      
      if (isMatch) {
        const foundPayment = {
            ...announcement,
            amountFormatted: announcement.tokenAddress
              ? `${ethers.formatUnits(announcement.amount, 18)} TOKEN`
              : `${ethers.formatEther(announcement.amount)} CFX`
        };
        
        matchedPayments.push(foundPayment);

        await recordReceived({
          ownerWallet: walletAddress,
          announcementId: announcement._id,
          stealthAddress: announcement.stealthAddress,
          ephemeralPubKey: announcement.ephemeralPubKey,
          tokenAddress: announcement.tokenAddress,
          amount: announcement.amount,
          amountFormatted: foundPayment.amountFormatted,
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
      matchedPayments
    });
  }, [walletAddress, getAnnouncements, checkpoint, updateCheckpoint, recordReceived]);

  const removePayment = useCallback((announcementId: string) => {
    setScanResult(prev => ({
      ...prev,
      matchedPayments: prev.matchedPayments.filter(p => p._id !== announcementId)
    }));
  }, []);

  return { scan, scanResult, checkpoint, removePayment };
}
