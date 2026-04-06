# VeilPay 🛡️ 💸

**VeilPay** is a privacy-first, automated DeFi micro-investment platform built on the **Conflux eSpace** ecosystem. It allows users to round up their daily transactions and automatically invest the spare change into diversified assets—all while maintaining complete financial privacy through EIP-5564 stealth addresses.

---

## ✨ Features

- **🛡️ Stealth Payments**: Built-in privacy using EIP-5564 compliant stealth addresses. Send and receive funds without revealing your main wallet address.
- **🔄 Automated Round-ups**: Automatically round up every transaction to the nearest $5 (or custom multiplier) and invest the difference.
- **🧠 AI-Powered Insights**: Get personalized investment recommendations and spending analysis based on your financial patterns.
- **📈 Growth Tracking**: Visualize your portfolio performance with real-time analytics and year-end projections.
- **🎨 Acid Green Design**: 
    - High-contrast, premium "Acid Green" and dark theme.
    - Custom micro-animations for transaction feedback.
    - Glassmorphic components and fluid layouts.

---

## 🛠️ Technical Deep Dive

### 🕵️ Stealth Address Scanning (`src/lib/stealth.ts`)
VeilPay implements a client-side scanning mechanism to ensure user privacy. When a user logs in:
1.  The app fetches indexed `announcements` from Convex.
2.  The browser executes `scanAnnouncement` using the user's **private viewing key**.
3.  If a match is found (shared secret matches the `viewTag`), the payment is revealed to the user.
4.  The server (Convex) only stores the results *after* the client has decrypted them, ensuring the server never knows your viewing keys.

### 🔌 Convex Backend Integration
We use **Convex** for real-time data management:
- **Indexing**: Polling on-chain events via `scripts/pollIndexer.ts`.
- **Reactive UI**: Frontend components use `useQuery` to stay in sync with the latest payments and announcements.
- **Checkpoints**: `scanCheckpoints` track how far the chain has been scanned to optimize performance.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Vanilla CSS, TailwindCSS (Base), Lucide Icons, Recharts
- **Blockchain**: Conflux eSpace (Testnet)
- **Privacy**: EIP-5564 Stealth Addresses, @noble/curves
- **Contracts**: Solidity, Hardhat

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Metamask wallet configured for Conflux eSpace Testnet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/veilpay.git
   cd veilpay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (refer to `.env.example`).

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📜 Smart Contracts

VeilPay utilizes two core contracts on Conflux eSpace:
- **StealthRegistry**: Maps stealth meta-addresses to user wallets.
- **StealthAnnouncer**: Handles the emission of stealth transfer events.

**Contract Addresses (eSpace Testnet):**
- StealthRegistry: `0x32825cf98aA9f1fA10D2025B06894094F765B177`
- StealthAnnouncer: `0x37672d29a18F8681F72c8ecB98b99C1F08e34772`

---

## 📄 License

This project is licensed under the MIT License.
