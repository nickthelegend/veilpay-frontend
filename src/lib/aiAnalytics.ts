// AI Analytics Engine for VeilPay
// Analyzes spending patterns and provides personalized investment insights

import type { Transaction, Investment } from './mockData';

export interface SpendingPattern {
  category: string;
  totalSpent: number;
  transactionCount: number;
  averageAmount: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'achievement' | 'prediction';
  title: string;
  description: string;
  impact: number; // USD amount
  category?: string;
  actionable: boolean;
  action?: string;
  icon: string;
}

export interface YearEndProjection {
  currentSavings: number;
  projectedSavings: number;
  projectedInvestmentValue: number;
  projectedReturns: number;
  confidence: number; // 0-100
  monthlyAverage: number;
  bestCaseScenario: number;
  worstCaseScenario: number;
}

export interface InvestmentRecommendation {
  type: 'stock' | 'crypto' | 'gold' | 'mixed';
  allocation: { type: string; percentage: number; amount: number }[];
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  timeHorizon: string;
}

/**
 * Analyze spending patterns from transactions
 */
export function analyzeSpendingPatterns(
  transactions: Transaction[],
  historicalTransactions?: Transaction[]
): SpendingPattern[] {
  const categoryMap = new Map<string, { total: number; count: number }>();

  // Aggregate by category
  transactions.forEach(tx => {
    const existing = categoryMap.get(tx.category) || { total: 0, count: 0 };
    categoryMap.set(tx.category, {
      total: existing.total + tx.originalAmount,
      count: existing.count + 1
    });
  });

  const totalSpent = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.total, 0);

  // Calculate patterns with trends
  const patterns: SpendingPattern[] = Array.from(categoryMap.entries()).map(([category, data]) => {
    const trend = calculateTrend(category, transactions, historicalTransactions);
    
    return {
      category,
      totalSpent: data.total,
      transactionCount: data.count,
      averageAmount: data.total / data.count,
      percentage: (data.total / totalSpent) * 100,
      trend
    };
  });

  return patterns.sort((a, b) => b.totalSpent - a.totalSpent);
}

/**
 * Calculate spending trend for a category
 */
function calculateTrend(
  category: string,
  current: Transaction[],
  historical?: Transaction[]
): 'increasing' | 'decreasing' | 'stable' {
  if (!historical || historical.length === 0) return 'stable';

  const currentTotal = current
    .filter(tx => tx.category === category)
    .reduce((sum, tx) => sum + tx.originalAmount, 0);

  const historicalTotal = historical
    .filter(tx => tx.category === category)
    .reduce((sum, tx) => sum + tx.originalAmount, 0);

  const change = ((currentTotal - historicalTotal) / historicalTotal) * 100;

  if (change > 15) return 'increasing';
  if (change < -15) return 'decreasing';
  return 'stable';
}

/**
 * Generate AI-powered insights based on spending patterns
 */
export function generateAIInsights(
  transactions: Transaction[],
  patterns: SpendingPattern[],
  currentInvestments: Investment[],
  userBalance: number
): AIInsight[] {
  const insights: AIInsight[] = [];

  // High spending category warning
  const topCategory = patterns[0];
  if (topCategory && topCategory.percentage > 30) {
    insights.push({
      id: 'high-spending-warning',
      type: 'warning',
      title: `High ${topCategory.category} spending`,
      description: `You are spending ${topCategory.percentage.toFixed(0)}% of your total on ${topCategory.category}. There might be saving opportunities here.`,
      impact: topCategory.totalSpent * 0.15,
      category: topCategory.category,
      actionable: true,
      action: 'Check alternatives',
      icon: '⚠️'
    });
  }

  // Increasing trend warning
  const increasingCategories = patterns.filter(p => p.trend === 'increasing');
  if (increasingCategories.length > 0) {
    const category = increasingCategories[0];
    insights.push({
      id: 'increasing-trend',
      type: 'warning',
      title: `${category.category} spending is rising`,
      description: `Your ${category.category} spending has increased compared to last month. Consider reviewing your budget.`,
      impact: category.totalSpent * 0.1,
      category: category.category,
      actionable: true,
      action: 'Set budget limit',
      icon: '📈'
    });
  }

  // Round-up opportunity
  const avgRoundUp = transactions.reduce((sum, tx) => sum + tx.investedAmount, 0) / transactions.length;
  const potentialIncrease = avgRoundUp * transactions.length * 0.5;
  insights.push({
    id: 'roundup-opportunity',
    type: 'opportunity',
    title: 'Boost your round-ups',
    description: `Increase your round-up multiplier to 2x and invest $${potentialIncrease.toFixed(0)} more per month.`,
    impact: potentialIncrease,
    actionable: true,
    action: 'Increase multiplier',
    icon: '💡'
  });

  // Investment diversification
  const investmentTypes = new Set(currentInvestments.map(inv => inv.type));
  if (investmentTypes.size < 3) {
    insights.push({
      id: 'diversification',
      type: 'opportunity',
      title: 'Diversify your portfolio',
      description: 'Spread your investments across different asset classes to reduce risk.',
      impact: 0,
      actionable: true,
      action: 'See options',
      icon: '🎯'
    });
  }

  // Achievement: consistent saving
  const totalInvested = transactions.reduce((sum, tx) => sum + tx.investedAmount, 0);
  if (totalInvested > 100) {
    insights.push({
      id: 'saving-achievement',
      type: 'achievement',
      title: 'You\'re doing great!',
      description: `You've invested $${totalInvested.toFixed(0)} this month. Keep up the consistent saving!`,
      impact: totalInvested,
      actionable: false,
      icon: '🎉'
    });
  }

  return insights;
}

/**
 * Project year-end savings based on current patterns
 */
export function projectYearEndSavings(
  transactions: Transaction[],
  currentInvestments: Investment[],
  monthsRemaining: number = 11
): YearEndProjection {
  // Calculate monthly average from recent transactions
  const totalInvested = transactions.reduce((sum, tx) => sum + tx.investedAmount, 0);
  const monthlyAverage = totalInvested; // Assuming transactions are from current month

  // Current investment value
  const currentValue = currentInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  
  // Average return rate from current investments
  const avgReturnRate = currentInvestments.reduce((sum, inv) => {
    const returnRate = (inv.currentValue - inv.amount) / inv.amount;
    return sum + returnRate;
  }, 0) / currentInvestments.length;

  // Project future savings with compound returns
  let projectedValue = currentValue;
  const monthlyReturn = avgReturnRate / 12;

  for (let i = 0; i < monthsRemaining; i++) {
    projectedValue = projectedValue * (1 + monthlyReturn) + monthlyAverage;
  }

  const projectedSavings = monthlyAverage * monthsRemaining;
  const projectedReturns = projectedValue - currentValue - projectedSavings;

  // Calculate confidence based on transaction consistency
  const confidence = Math.min(95, 70 + (transactions.length * 2));

  // Best/worst case scenarios (±30%)
  const bestCase = projectedValue * 1.3;
  const worstCase = projectedValue * 0.7;

  return {
    currentSavings: currentValue,
    projectedSavings,
    projectedInvestmentValue: projectedValue,
    projectedReturns,
    confidence,
    monthlyAverage,
    bestCaseScenario: bestCase,
    worstCaseScenario: worstCase
  };
}

/**
 * Generate personalized investment recommendations
 */
export function generateInvestmentRecommendation(
  patterns: SpendingPattern[],
  currentInvestments: Investment[],
  riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
): InvestmentRecommendation {
  // Analyze current allocation
  const currentAllocation = {
    stock: 0,
    crypto: 0,
    gold: 0
  };

  currentInvestments.forEach(inv => {
    currentAllocation[inv.type] = inv.amount;
  });

  const total = Object.values(currentAllocation).reduce((sum, val) => sum + val, 0);

  // Recommended allocation based on risk tolerance
  let allocation: { type: string; percentage: number; amount: number }[];
  let riskLevel: 'low' | 'medium' | 'high';
  let expectedReturn: number;
  let reasoning: string;

  if (riskTolerance === 'conservative') {
    allocation = [
      { type: 'gold', percentage: 50, amount: 0 },
      { type: 'stock', percentage: 40, amount: 0 },
      { type: 'crypto', percentage: 10, amount: 0 }
    ];
    riskLevel = 'low';
    expectedReturn = 8;
    reasoning = 'Portfolio focused on safe and steady growth. Risk is minimized with a gold-heavy allocation.';
  } else if (riskTolerance === 'aggressive') {
    allocation = [
      { type: 'crypto', percentage: 40, amount: 0 },
      { type: 'stock', percentage: 40, amount: 0 },
      { type: 'gold', percentage: 20, amount: 0 }
    ];
    riskLevel = 'high';
    expectedReturn = 18;
    reasoning = 'Aggressive portfolio with high return potential. Weighted towards crypto and stocks.';
  } else {
    allocation = [
      { type: 'stock', percentage: 45, amount: 0 },
      { type: 'gold', percentage: 30, amount: 0 },
      { type: 'crypto', percentage: 25, amount: 0 }
    ];
    riskLevel = 'medium';
    expectedReturn = 12;
    reasoning = 'Diversified portfolio offering a balanced risk-return ratio. Targeted for medium-term growth.';
  }

  // Calculate amounts based on current total
  allocation = allocation.map(item => ({
    ...item,
    amount: (total * item.percentage) / 100
  }));

  return {
    type: 'mixed',
    allocation,
    reasoning,
    riskLevel,
    expectedReturn,
    timeHorizon: '1-3 years'
  };
}

/**
 * Analyze spending behavior and provide smart suggestions
 */
export function analyzeSpendingBehavior(transactions: Transaction[]): {
  avgTransactionAmount: number;
  avgDailySpending: number;
  mostActiveDay: string;
  mostActiveCategory: string;
  savingPotential: number;
} {
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.originalAmount, 0);
  const avgTransactionAmount = totalSpent / transactions.length;

  // Group by date
  const dailySpending = new Map<string, number>();
  transactions.forEach(tx => {
    const date = tx.date.split('T')[0];
    dailySpending.set(date, (dailySpending.get(date) || 0) + tx.originalAmount);
  });

  const avgDailySpending = totalSpent / dailySpending.size;

  // Find most active day
  let maxSpending = 0;
  let mostActiveDay = '';
  dailySpending.forEach((amount, date) => {
    if (amount > maxSpending) {
      maxSpending = amount;
      mostActiveDay = date;
    }
  });

  // Most active category
  const categorySpending = new Map<string, number>();
  transactions.forEach(tx => {
    categorySpending.set(tx.category, (categorySpending.get(tx.category) || 0) + tx.originalAmount);
  });

  let mostActiveCategory = '';
  let maxCategorySpending = 0;
  categorySpending.forEach((amount, category) => {
    if (amount > maxCategorySpending) {
      maxCategorySpending = amount;
      mostActiveCategory = category;
    }
  });

  // Calculate saving potential (15% of discretionary spending)
  const discretionaryCategories = ['Food & Drinks', 'Entertainment', 'Clothing'];
  const discretionarySpending = transactions
    .filter(tx => discretionaryCategories.includes(tx.category))
    .reduce((sum, tx) => sum + tx.originalAmount, 0);

  const savingPotential = discretionarySpending * 0.15;

  return {
    avgTransactionAmount,
    avgDailySpending,
    mostActiveDay,
    mostActiveCategory,
    savingPotential
  };
}

