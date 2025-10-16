# AllianceDAO NFT Transaction Tracker - Part 1
## Overview & Critical Design Principles

**Version:** 1.0  
**Date:** October 16, 2025  
**Part:** 1 of 5

---

## Overview

### Project Context
AllianceDAO NFT collection operates on Terra blockchain with 10,000 NFTs that generate passive income through Alliance staking rewards. This tracker monitors all on-chain activity related to these NFTs.

### Key Contracts
- **NFT Contract:** `terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9`
- **Reward Token (ampLUNA):** `terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct`
- **DAODao Staking:** `terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47`

### Total Transaction Types Documented: 25

---

## Critical Design Principles

### 🚨 RULE #1: Always Handle Multiple NFTs

Every transaction pattern MUST support both single and multiple NFTs:

```javascript
// ❌ WRONG - Only handles single NFT
if (tx.body.messages[0].msg.transfer_nft.token_id === "1234") {
  // Process...
}

// ✅ CORRECT - Handles single OR multiple
const messages = tx.body.messages;
messages.forEach(msg => {
  if (msg.msg.transfer_nft) {
    const tokenId = msg.msg.transfer_nft.token_id;
    // Process each NFT...
  }
});

// ✅ ALSO CORRECT - For array-based messages
const tokenIds = tx.body.messages[0].msg.unstake?.token_ids || 
                 [tx.body.messages[0].msg.transfer_nft?.token_id];
```

### 🚨 RULE #2: Pattern Matching Hierarchy

Always check patterns in this order:
1. **Contract address** (most reliable)
2. **Message structure**
3. **Action type in events**
4. **Memo** (least reliable, can be missing)

```javascript
function identifyTransaction(tx) {
  // 1. Check contract FIRST
  const contract = tx.body.messages[0].contract;
  
  // 2. Then check message structure
  const msg = tx.body.messages[0].msg;
  
  // 3. Then check actions in events
  const actions = tx.events
    .filter(e => e.type === "wasm")
    .flatMap(e => e.attributes.filter(a => a.key === "action"))
    .map(a => a.value);
  
  // 4. Finally check memo (optional)
  const memo = tx.body.memo;
  
  // Now identify...
}
```

### 🚨 RULE #3: Defensive Data Extraction

Always handle missing or malformed data:

```javascript
// ✅ SAFE extraction
const tokenIds = [];

// Method 1: From message (array format)
if (tx.body.messages[0].msg.unstake?.token_ids) {
  tokenIds.push(...tx.body.messages[0].msg.unstake.token_ids);
}

// Method 2: From events (when message doesn't contain it)
tx.events.forEach(event => {
  if (event.type === "wasm") {
    event.attributes.forEach(attr => {
      if (attr.key === "token_id") {
        tokenIds.push(attr.value);
      }
    });
  }
});

// Method 3: From multiple messages (batch transfers)
tx.body.messages.forEach(msg => {
  if (msg.msg.transfer_nft?.token_id) {
    tokenIds.push(msg.msg.transfer_nft.token_id);
  }
});

// Deduplicate and validate
const uniqueTokenIds = [...new Set(tokenIds)].filter(id => id);
```

### 🚨 RULE #4: Event Deduplication

NFT events often appear multiple times in transaction logs:

```javascript
function extractUniqueNFTs(tx) {
  const nftMap = new Map();
  
  tx.events.forEach(event => {
    if (event.type === "wasm") {
      let tokenId, action, contract;
      
      event.attributes.forEach(attr => {
        if (attr.key === "token_id") tokenId = attr.value;
        if (attr.key === "action") action = attr.value;
        if (attr.key === "_contract_address") contract = attr.value;
      });
      
      if (tokenId && action === "transfer_nft") {
        nftMap.set(tokenId, { tokenId, action, contract });
      }
    }
  });
  
  return Array.from(nftMap.values());
}
```

---

## Event Type Categories

### Core Protocol Events (5)
1. ALLY Rewards Claim (daily revenue)
2. ALLY Rewards Claim Failed (monitoring)
3. NFT Break (revenue distribution)
4. Enterprise Unstake (legacy cleanup)
5. DAODao Stake

### DAODao Governance (3)
6. DAODao Stake (manual)
7. DAODao Unstake (start unbonding)
8. DAODao Claim (complete unstake)

### BBL Marketplace (4)
9. BBL Listing
10. BBL Sale
11. BBL Cancel
12. BBL Collection Offer

### Boost Marketplace (4)
13. Boost Listing
14. Boost OTC (Private Sale)
15. Boost Sale
16. Boost Cancel

### Boost Tools (4)
17. Boost Break
18. Boost Transfer
19. Boost Stake
20. Enterprise Unstake Tool

### NFT Switch (4)
21. NFT Switch Batch Transfer
22. NFT Switch OTC Create
23. NFT Switch OTC Confirm
24. NFT Switch OTC Complete

### Basic Transfers (1)
25. P2P Transfer (manual)

---

## Transaction Format

All transactions follow this structure:

```javascript
{
  // Event Identification
  eventType: string,              // One of 25 types
  txHash: string,                 // Unique identifier
  blockHeight: number,
  timestamp: ISO8601,
  
  // NFT Details (ALWAYS ARRAY for scalability)
  tokenIds: [string],            // ⚠️ ARRAY even for single NFT
  nftCount: number,
  nftContract: string,
  
  // Parties
  sender: string,
  recipient: string,             // If applicable
  
  // Platform
  platform: string,              // Boost, BBL, NFTSwitch, Manual
  
  // Gas
  gasFeePaid: number,
  gasWanted: number,
  gasUsed: number,
  
  // Event-specific fields...
}
```

---

## Quick Reference: Where to Find NFT IDs

| Event Type | NFT ID Location | Format | Count |
|------------|----------------|--------|-------|
| NFT Break | `msg.break_nft` | String | Single only |
| DAODao Stake | `msg.send_nft.token_id` | String | Can be multiple messages |
| DAODao Unstake | `msg.unstake.token_ids` | Array | Multiple |
| DAODao Claim | Events only | Events | Multiple |
| BBL/Boost Listing | `msg.send_nft.token_id` | String | Single |
| BBL/Boost Sale | Events only | Events | Single |
| Boost Transfer | `msg.transfer_nft.token_id` | String | Single |
| NFT Switch Batch | Multiple messages | String per message | Multiple |
| Enterprise Unstake | Events only | Events | Multiple |

---

## Next Files

- **Part 2:** Event Catalog (Events 1-13)
- **Part 3:** Event Catalog (Events 14-25)
- **Part 4:** Address Directory + Pattern Matching Code
- **Part 5:** Database Schemas + Analytics

---

**GitHub:** Save as `01-overview-and-principles.md`  
**Website:** Link to this file for methodology transparency