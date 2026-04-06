// Mock data for VeilPay demo application

export interface Card {
    id: string;
    type: 'visa' | 'mastercard';
    lastFour: string;
    holderName: string;
    expiryDate: string;
    balance: number;
    color: 'teal' | 'mint' | 'peach';
}

export interface Transaction {
    id: string;
    merchant: string;
    category: string;
    originalAmount: number;
    roundedAmount: number;
    investedAmount: number;
    date: string;
    icon: string;
}

export interface Investment {
    id: string;
    type: 'stock' | 'crypto' | 'gold';
    name: string;
    symbol: string;
    amount: number;
    currentValue: number;
    percentageChange: number;
    allocation: number;
}

export interface BalanceHistory {
    date: string;
    balance: number;
    invested: number;
}

// Demo User: Cankat Polat
export const demoUser = {
    id: "user_001",
    name: "Cankat Polat",
    email: "cankat@example.com",
    avatar: "/avatar.png",
    totalBalance: 25480.50,
    totalInvested: 3245.80,
    totalReturns: 412.35,
    roundUpEnabled: true,
    extendedRoundUp: false, // >10% round up option
    roundUpMultiplier: 1, // 1 = normal, 2 = 2x, 5 = 5x
};

export const cards: Card[] = [
    {
        id: "card_001",
        type: "visa",
        lastFour: "4580",
        holderName: "Cankat Polat",
        expiryDate: "12/27",
        balance: 14850.00,
        color: "teal",
    },
    {
        id: "card_002",
        type: "visa",
        lastFour: "7634",
        holderName: "Cankat Polat",
        expiryDate: "08/26",
        balance: 7250.50,
        color: "mint",
    },
    {
        id: "card_003",
        type: "mastercard",
        lastFour: "3506",
        holderName: "Cankat Polat",
        expiryDate: "03/28",
        balance: 3380.00,
        color: "peach",
    },
];

export const recentTransactions: Transaction[] = [
    {
        id: "tx_001",
        merchant: "Starbucks",
        category: "Food & Drink",
        originalAmount: 127.50,
        roundedAmount: 130.00,
        investedAmount: 2.50,
        date: "2026-01-31",
        icon: "coffee",
    },
    {
        id: "tx_002",
        merchant: "Whole Foods",
        category: "Grocery",
        originalAmount: 342.75,
        roundedAmount: 350.00,
        investedAmount: 7.25,
        date: "2026-01-31",
        icon: "shopping-cart",
    },
    {
        id: "tx_003",
        merchant: "Shell",
        category: "Fuel",
        originalAmount: 856.30,
        roundedAmount: 860.00,
        investedAmount: 3.70,
        date: "2026-01-30",
        icon: "fuel",
    },
    {
        id: "tx_004",
        merchant: "Netflix",
        category: "Entertainment",
        originalAmount: 99.99,
        roundedAmount: 100.00,
        investedAmount: 0.01,
        date: "2026-01-30",
        icon: "tv",
    },
    {
        id: "tx_005",
        merchant: "Zara",
        category: "Clothing",
        originalAmount: 1245.00,
        roundedAmount: 1250.00,
        investedAmount: 5.00,
        date: "2026-01-29",
        icon: "shirt",
    },
    {
        id: "tx_006",
        merchant: "Pharmacy",
        category: "Health",
        originalAmount: 78.25,
        roundedAmount: 80.00,
        investedAmount: 1.75,
        date: "2026-01-29",
        icon: "pill",
    },
    {
        id: "tx_007",
        merchant: "Uber",
        category: "Transport",
        originalAmount: 64.50,
        roundedAmount: 70.00,
        investedAmount: 5.50,
        date: "2026-01-28",
        icon: "car",
    },
    {
        id: "tx_008",
        merchant: "Apple Store",
        category: "Technology",
        originalAmount: 2499.00,
        roundedAmount: 2500.00,
        investedAmount: 1.00,
        date: "2026-01-28",
        icon: "smartphone",
    },
];

export const investments: Investment[] = [
    {
        id: "inv_001",
        type: "stock",
        name: "Standard & Poor's 500",
        symbol: "S&P 500",
        amount: 1250.50,
        currentValue: 1412.30,
        percentageChange: 12.94,
        allocation: 40,
    },
    {
        id: "inv_002",
        type: "crypto",
        name: "Bitcoin",
        symbol: "BTC",
        amount: 980.00,
        currentValue: 1156.80,
        percentageChange: 18.04,
        allocation: 30,
    },
    {
        id: "inv_003",
        type: "gold",
        name: "Gold",
        symbol: "XAU",
        amount: 850.00,
        currentValue: 923.45,
        percentageChange: 8.64,
        allocation: 30,
    },
];

export const dailyBalanceHistory: BalanceHistory[] = [
    { date: "09:00", balance: 25380, invested: 3240 },
    { date: "10:00", balance: 25395, invested: 3242 },
    { date: "11:00", balance: 25420, invested: 3243 },
    { date: "12:00", balance: 25450, invested: 3244 },
    { date: "13:00", balance: 25430, invested: 3244 },
    { date: "14:00", balance: 25465, invested: 3245 },
    { date: "15:00", balance: 25480, invested: 3245 },
    { date: "16:00", balance: 25490, invested: 3246 },
];

export const weeklyBalanceHistory: BalanceHistory[] = [
    { date: "Mon", balance: 23500, invested: 2980 },
    { date: "Tue", balance: 23850, invested: 3050 },
    { date: "Wed", balance: 24120, invested: 3120 },
    { date: "Thu", balance: 24680, invested: 3180 },
    { date: "Fri", balance: 25100, invested: 3220 },
    { date: "Sat", balance: 25320, invested: 3240 },
    { date: "Sun", balance: 25480, invested: 3245 },
];

export const monthlyBalanceHistory: BalanceHistory[] = [
    { date: "Week 1", balance: 22800, invested: 2850 },
    { date: "Week 2", balance: 23600, invested: 3000 },
    { date: "Week 3", balance: 24400, invested: 3120 },
    { date: "Week 4", balance: 25100, invested: 3200 },
    { date: "Week 5", balance: 25480, invested: 3245 },
];

export const monthlyInvestmentHistory = [
    { month: "Jan", invested: 280, returns: 32 },
    { month: "Feb", invested: 320, returns: 45 },
    { month: "Mar", invested: 295, returns: 38 },
    { month: "Apr", invested: 410, returns: 52 },
    { month: "May", invested: 380, returns: 48 },
    { month: "Jun", invested: 450, returns: 65 },
    { month: "Jul", invested: 420, returns: 58 },
    { month: "Aug", invested: 390, returns: 51 },
    { month: "Sep", invested: 480, returns: 72 },
    { month: "Oct", invested: 520, returns: 85 },
    { month: "Nov", invested: 490, returns: 78 },
    { month: "Dec", invested: 545, returns: 92 },
];

// Investment options for user selection
export const investmentOptions = [
    {
        id: "opt_stock",
        type: "stock",
        name: "Stocks",
        description: "Investment in global stock markets",
        icon: "📈",
        riskLevel: "Medium",
        expectedReturn: "8-15%",
    },
    {
        id: "opt_crypto",
        type: "crypto",
        name: "Cryptocurrency",
        description: "Bitcoin, Ethereum and more",
        icon: "₿",
        riskLevel: "High",
        expectedReturn: "15-50%",
    },
    {
        id: "opt_gold",
        type: "gold",
        name: "Gold",
        description: "Safe haven investment",
        icon: "🥇",
        riskLevel: "Low",
        expectedReturn: "5-10%",
    },
];

// Round-up settings
export const roundUpSettings = [
    { id: "basic", name: "Basic VeilPay", description: "Round up to the nearest $1" },
    { id: "extended", name: "Extended", description: ">10% round up active" },
    { id: "multiplier", name: "Multiplier", description: "Multiply round up amount by 2x, 5x, or 10x" },
];
