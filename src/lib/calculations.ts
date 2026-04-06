// Calculation utilities for VeilPay app

/**
 * Calculate round-up amount based on the original amount and settings
 * @param originalAmount - The original transaction amount
 * @param extendedRoundUp - If true, rounds up more aggressively (>10%)
 * @param multiplier - Multiplier for the round-up amount (1, 2, 5, 10)
 * @returns Object with rounded amount and invested amount
 */
export function calculateRoundUp(
    originalAmount: number,
    extendedRoundUp: boolean = false,
    multiplier: number = 1
): { roundedAmount: number; investedAmount: number } {
    const roundedAmount = extendedRoundUp
        ? (() => {
            // Extended round-up: round to next $10 if difference would be >10%
            const nextFive = Math.ceil(originalAmount / 5) * 5;
            const nextTen = Math.ceil(originalAmount / 10) * 10;

            // If basic round-up is less than 10% of original, use next 10
            const basicDiff = nextFive - originalAmount;
            const extendedDiff = nextTen - originalAmount;

            if (basicDiff / originalAmount < 0.10 && extendedDiff / originalAmount <= 0.20) {
                return nextTen;
            } else {
                return nextFive;
            }
        })()
        : Math.ceil(originalAmount / 5) * 5;

    // Adjust if already a round number
    const finalRoundedAmount = roundedAmount === originalAmount ? roundedAmount + 5 : roundedAmount;

    const investedAmount = (finalRoundedAmount - originalAmount) * multiplier;

    return {
        roundedAmount: finalRoundedAmount + (investedAmount - (finalRoundedAmount - originalAmount)),
        investedAmount: Number(investedAmount.toFixed(2)),
    };
}

/**
 * Format currency in USD
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Format currency without symbol
 */
export function formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Short format for large numbers
 */
export function formatShortCurrency(amount: number): string {
    if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
}

/**
 * Calculate compound investment growth
 * @param initialDeposit - Starting amount
 * @param monthlyContribution - Monthly contribution
 * @param years - Number of years
 * @param annualReturn - Expected annual return (as decimal, e.g., 0.08 for 8%)
 * @returns Array of yearly projections
 */
export function calculateInvestmentGrowth(
    initialDeposit: number,
    monthlyContribution: number,
    years: number,
    annualReturn: number
): { year: number; invested: number; returns: number; total: number }[] {
    const results = [];
    const monthlyRate = annualReturn / 12;

    let totalInvested = initialDeposit;
    let currentValue = initialDeposit;

    for (let year = 1; year <= years; year++) {
        for (let m = 1; m <= 12; m++) {
            currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
            totalInvested += monthlyContribution;
        }

        results.push({
            year: new Date().getFullYear() + year,
            invested: Math.round(totalInvested),
            returns: Math.round(currentValue - totalInvested),
            total: Math.round(currentValue),
        });
    }

    return results;
}

/**
 * Calculate monthly contribution from round-ups
 * Based on average spending patterns
 */
export function estimateMonthlyRoundUp(
    averageTransactionsPerDay: number = 3,
    averageRoundUpPerTransaction: number = 3.5
): number {
    return averageTransactionsPerDay * averageRoundUpPerTransaction * 30;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
    original: number,
    current: number
): number {
    return Number((((current - original) / original) * 100).toFixed(2));
}

/**
 * Get contribution frequency multiplier
 */
export function getContributionMultiplier(frequency: 'daily' | 'weekly' | 'monthly' | 'annual'): number {
    switch (frequency) {
        case 'daily':
            return 365;
        case 'weekly':
            return 52;
        case 'monthly':
            return 12;
        case 'annual':
            return 1;
        default:
            return 12;
    }
}

/**
 * Format date in English locale
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

/**
 * Get time ago string
 */
export function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

