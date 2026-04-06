# VeilPay Video Demonstration Script

Follow this sequence to showcase the full power of VeilPay's stealth payment system on the Conflux eSpace Testnet.

## Video Scene 1: The Privacy Dashboard
1. **Connect Wallet**: Start by clicking "Connect Wallet". Observe the sleek primary neon theme and background.
2. **Identity Registration**: 
   - Scroll to the "Your Stealth Identity" card.
   - If it says "Unprotected", click the (+) button to register your stealth meta-address on-chain.
   - Mention that this derives a unique, private meta-address from your public key without compromising your main wallet address.

## Video Scene 2: Making a Stealth Payment
1. **Navigate to Payments**: Click the "Pay" icon in the navigation bar.
2. **Configure Payment**:
   - Enter a recipient's stealth meta-address (use a test address provided or create a second account).
   - Enter an amount (e.g., 0.1 CFX).
   - Click "Send Shielded Payment".
3. **The Reveal**: Show the transaction confirmation and explain that the `StealthAnnouncer` contract is now emitting a cryptographically blinded event that only the recipient can see.

## Video Scene 3: The Stealth Scan
1. **Switch Account** (if possible) or stay on the current one to see receiving.
2. **Scan**: 
   - Click "Scan Balance".
   - Watch the progress bar as the app locally scans the `announcements` table in Convex.
   - Explain that this scanning happens purely client-side using your viewing key—no one else knows which payments are yours.
3. **Success**: Once a match is found, observe the balance increasing and the "Recent Activity" updating with the new stealth payment.

## Video Scene 4: AI Privacy Diagnostics
1. **AI Insights**: Point out the "AI Privacy Diagnostic" widget on the dashboard.
2. **Insight Generation**: Click "Generate Insight".
3. **Review**: Show the AI feedback (e.g., "Your privacy health is 95%") and explain how it helps users maintain optimal stealth habits.

## Video Scene 5: Analytics & Growth
1. **Navigate to Analytics**: Show the line chart.
2. **Live Data**: Explain that the chart is derived directly from live stealth transactions synced through Convex, not mock data.

---
### Technical Tips for the Video:
- **Chain**: Conflux eSpace Testnet (Chain ID 71).
- **Faucet**: Ensure you have some test CFX before starting.
- **RPC**: The app uses the Validation Cloud endpoint for smooth performance.
