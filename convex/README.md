# VeilPay Convex Backend 🧠

This directory contains the Convex functions and schema that power the VeilPay backend. Convex provides a reactive, real-time database and serverless functions for the project.

## 🗃️ Database Schema (`schema.ts`)

The backend is built around several key tables designed for stealth payment tracking:

- **`stealthRegistrations`**: Stores the mapping between public wallet addresses and their registered EIP-5564 stealth meta-addresses.
- **`announcements`**: A global index of all stealth payment events emitted from the `StealthAnnouncer` contract. This includes ephemeral public keys and encrypted metadata.
- **`receivedPayments`**: A user-specific "inbox" that stores announcements that have been successfully matched by a user's client-side scanning process.
- **`sentPayments`**: Tracks outgoing stealth payments sent by users, allowing them to monitor the status of their transactions.
- **`scanCheckpoints`**: Tracks the synchronization progress for each user, ensuring they don't re-scan blocks they've already processed.
- **`userProfiles`**: Stores non-sensitive user metadata and preferences.

## 🛠️ Key Function Modules

### `announcements.ts`
Handles the indexing and querying of global stealth payment events.
- **`addAnnouncement`**: Mutation called by the indexer to store new on-chain events.
- **`getRecent`**: Query to fetch the latest announcements for global activity feeds.

### `payments.ts`
Manages the lifecycle of both sent and received stealth payments.
- **`trackSentPayment`**: Marks a new outgoing transaction.
- **`confirmReceived`**: Called by the client-side scanner when a match is found.

### `scanning.ts`
Provides utilities for the scanning process.
- **`getScanBatch`**: Efficiently fetches a batch of announcements for the client to scan.
- **`updateCheckpoint`**: Saves the user's progress through the announcement log.

### `users.ts`
Manages user registration and profile updates.
- **`register`**: Links a wallet to a stealth meta-address.
- **`getProfile`**: Retrieves user-specific configuration.

## 🚀 Development

### Running the Indexer
The indexer is a separate process that polls the Conflux eSpace RPC and pushes data to Convex.
```bash
# In the veilpay directory
npm run indexer
```

### Deploying Functions
Convex functions are automatically deployed when running the dev server:
```bash
npx convex dev
```

For production deployment:
```bash
npx convex deploy
```
