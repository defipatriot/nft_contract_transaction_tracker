# Alliance DAO NFT Transaction Explorer
## Event Detection & Classification

**Version:** 2.0  
**Date:** October 29, 2025  
**Part:** 2 of 5

---

## Overview

This document explains how the Explorer detects and classifies the 25+ different transaction types. Each event has unique identifiers that allow reliable detection from blockchain transaction data.

---

## Detection Priority Hierarchy

The system checks patterns in this order for maximum reliability:

```
1. Contract Address (most reliable)
   ↓
2. Message Structure  
   ↓
3. Action Type (from events)
   ↓
4. Memo Field (least reliable)
   ↓
5. Cross-Message Analysis
```

### Why This Order?

- **Contract Address**: Cannot be faked, always accurate
- **Message Structure**: Defines the intent, very reliable
- **Action Type**: Set by smart contract, reliable
- **Memo**: Optional, can be missing or incorrect
- **Cross-Message**: Complex transactions need full context

---

## Core Protocol Events

### 1. Alliance Rewards Claim
**Event Type:** `ALLIANCE_CLAIM`  
**Frequency:** Daily (~8:50 AM UTC)

#### Detection Logic
```javascript
{
  contract: "terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9",
  msg: { claim_rewards: {} },
  action: "claim_rewards",
  code: 0  // Success
}
```

#### What Explorer Shows
```javascript
{
  eventType: "ALLIANCE_CLAIM",
  emoji: "💰",
  badge: "Alliance",
  explanation: "Daily rewards claimed from Alliance staking protocol",
  detectionMethod: "Looks for claim_rewards message to NFT contract",
  keyIndicator: "LUNA claim + ampLUNA mint in same transaction",
  note: "Distributes 90% to holders, 10% to treasury"
}
```

#### Click Event Badge Shows:
> **How Detected:**  
> 📋 Checks for `claim_rewards` message  
> 🔍 Key Indicator: LUNA claim + ampLUNA minting together  
> ⚠️ Note: Can fail if Alliance has no rewards available

---

### 2. Alliance Claim Failed
**Event Type:** `CLAIM_FAILED`

#### Detection Logic
```javascript
{
  contract: NFT_CONTRACT,
  msg: { claim_rewards: {} },
  code: 5,  // Non-zero = failed
  codespace: "wasm"
}
```

#### What Explorer Shows
```javascript
{
  emoji: "❌",
  badge: "Ally Failed",
  explanation: "Claim attempt failed - usually means no rewards available",
  detectionMethod: "Looks for failed claim_rewards transaction (code ≠ 0)",
  keyIndicator: "Transaction code is non-zero",
  note: "Should be made up on next successful claim"
}
```

---

### 3. NFT Break
**Event Type:** `BREAK`

#### Detection Logic
```javascript
{
  contract: NFT_CONTRACT,
  msg: { break_nft: "6748" },  // Single token ID (STRING)
  action: "break_nft"
}
```

#### Important Notes
- âš ï¸ **ALWAYS single NFT** - cannot batch break
- âš ï¸ NFT destroyed permanently
- âœ… Extracts ampLUNA rewards amount from events

#### What Explorer Shows
```javascript
{
  emoji: "💔",
  badge: "NFT Break",
  explanation: "NFT destroyed to claim its accumulated rewards",
  detectionMethod: "Looks for break_nft message with single token ID",
  keyIndicator: "NFT transfer to burn address + ampLUNA mint",
  note: "Irreversible - NFT cannot be recovered"
}
```

---

## DAODao Governance Events

### 4. DAODao Stake
**Event Type:** `DAODAO_STAKE`

#### Detection Logic
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47",
      token_id: "1033",
      msg: "eyJzdGFrZSI6e319"  // Base64: {"stake":{}}
    }
  },
  action: "stake"
}
```

#### Multi-NFT Support
- ✅ Can stake multiple NFTs in one transaction
- Each NFT gets its own message
- Loop through all messages to extract all token IDs

#### What Explorer Shows
```javascript
{
  emoji: "🔒",
  badge: "DAO Stake",
  explanation: "NFT locked in DAODao for governance voting power",
  detectionMethod: "Looks for send_nft to DAODao staking contract with stake message",
  keyIndicator: "Base64 decoded message contains {\"stake\":{}}",
  note: "Must unstake and wait 7 days to withdraw"
}
```

---

### 5. DAODao Unstake
**Event Type:** `DAODAO_UNSTAKE`

#### Detection Logic
```javascript
{
  contract: "terra1c57ur376...",
  msg: {
    unstake: {
      token_ids: ["1033", "6748", "2941"]  // ARRAY format
    }
  },
  claim_duration: "time: 604800"  // 7 days in seconds
}
```

#### Important Notes
- âœ… **ALWAYS array format** - even single NFT
- âš ï¸ NFTs enter 7-day unbonding period
- âš ï¸ Must call `claim_nfts` after unbonding ends

#### What Explorer Shows
```javascript
{
  emoji: "🔓",
  badge: "DAO Unstake",
  explanation: "Begin 7-day unbonding period for staked NFTs",
  detectionMethod: "Looks for unstake message with token_ids array",
  keyIndicator: "token_ids array + 604800 second unbonding duration",
  note: "Must claim after 7 days to receive NFTs back"
}
```

---

### 6. DAODao Claim NFTs
**Event Type:** `DAODAO_CLAIM_NFTS`

#### Detection Logic
```javascript
{
  contract: "terra1c57ur376...",
  msg: { claim_nfts: {} },  // Empty object
  action: "claim_nfts"
  // NFT IDs ONLY in events, NOT in message!
}
```

#### Critical Extraction Pattern
```javascript
// NFT IDs are NOT in the message
// Must extract from events:
function extractClaimedNFTs(tx) {
  const tokenIds = [];
  tx.events.forEach(event => {
    if (event.type === "wasm") {
      let tokenId, action, sender;
      event.attributes.forEach(attr => {
        if (attr.key === "token_id") tokenId = attr.value;
        if (attr.key === "action") action = attr.value;
        if (attr.key === "sender") sender = attr.value;
      });
      
      // Only count transfer_nft FROM staking contract
      if (action === "transfer_nft" && 
          sender === DAODAO_STAKING_CONTRACT) {
        tokenIds.push(tokenId);
      }
    }
  });
  return [...new Set(tokenIds)];  // Deduplicate
}
```

#### What Explorer Shows
```javascript
{
  emoji: "✅",
  badge: "DAO Claim",
  explanation: "Complete unbonding - receive NFTs back after 7 days",
  detectionMethod: "Looks for claim_nfts message + transfer events from staking",
  keyIndicator: "NFT transfers FROM DAODao staking contract TO claimer",
  note: "Claims all unbonded NFTs at once"
}
```

---

## BBL Marketplace Events

### 7. BBL Listing
**Event Type:** `BBL_LISTING`

#### Detection Logic
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1ej4cv98e9g2zjefr5auf2nwtq4xl3dm7x0qml58yna2ml2hk595s7gccs9",
      token_id: "6748",
      msg: "BASE64_ENCODED_LISTING_DETAILS"
    }
  },
  action: "create_auction"
}
```

#### Decode Price from Base64
```javascript
function decodeBBLListing(encoded) {
  const decoded = Buffer.from(encoded, 'base64').toString();
  const parsed = JSON.parse(decoded);
  return {
    price: parsed.list?.amount || parsed.sell?.amount,
    expiresAt: parsed.list?.expires_at || parsed.sell?.expires_at
  };
}
```

#### What Explorer Shows
```javascript
{
  emoji: "🏪",
  badge: "BBL List",
  explanation: "Listed for sale on BBL marketplace (Necropolis)",
  detectionMethod: "Looks for send_nft to BBL contract with auction details",
  keyIndicator: "Payment token is ALWAYS bLUNA",
  note: "7% total fees: 2% protocol + 5% DAO royalty"
}
```

---

### 8. BBL Sale
**Event Type:** `BBL_SALE`

#### Detection Logic
```javascript
{
  contract: "terra1ej4cv98e...",
  msg: { settle: { auction_id: "12345" } },
  action: "settle"
}
```

#### Fee Extraction
```javascript
// BBL fees: 2% protocol + 5% royalty + 93% to seller
function extractBBLFees(tx) {
  const transfers = extractTransfers(tx);
  transfers.sort((a, b) => a.amount - b.amount);
  
  return {
    protocolFee: transfers[0].amount,     // Smallest = 2%
    royaltyFee: transfers[1].amount,      // Middle = 5%
    sellerProceeds: transfers[2].amount,  // Largest = 93%
    totalSale: transfers.reduce((sum, t) => sum + t.amount, 0)
  };
}
```

#### What Explorer Shows
```javascript
{
  emoji: "✅",
  badge: "BBL Sale",
  explanation: "Sale completed on BBL marketplace",
  detectionMethod: "Looks for settle message + multiple bLUNA transfers",
  keyIndicator: "3 transfers: protocol fee (2%), DAO royalty (5%), seller (93%)",
  note: "NFT transferred to buyer, bLUNA to seller minus fees"
}
```

---

### 9. BBL Delist
**Event Type:** `BBL_DELIST`

#### Detection Logic
```javascript
{
  contract: "terra1ej4cv98e...",
  msg: { 
    cancel_auction: { auction_id: "12345" }
    // OR
    cancel: { auction_id: "12345" }
  },
  action: "cancel"
}
```

#### What Explorer Shows
```javascript
{
  emoji: "❌",
  badge: "BBL Delist",
  explanation: "Listing cancelled - NFT returned to seller",
  detectionMethod: "Looks for cancel_auction or cancel message",
  keyIndicator: "NFT transfer back to original owner",
  note: "No fees charged for cancellation"
}
```

---

### 10. BBL Collection Offer
**Event Type:** `BBL_COLLECTION_OFFER`

#### Detection Logic
```javascript
{
  contract: "terra1ej4cv98e...",
  msg: {
    make_collection_offer: {
      amount: "250000000",  // 250 bLUNA
      nft_contract: NFT_CONTRACT
    }
  }
}
```

#### What Explorer Shows
```javascript
{
  emoji: "🤝",
  badge: "BBL Offer",
  explanation: "Collection-wide offer - any NFT can accept",
  detectionMethod: "Looks for make_collection_offer message",
  keyIndicator: "No specific token_id - applies to entire collection",
  note: "First NFT holder to accept gets the deal"
}
```

---

## Boost Marketplace Events

### 11. Boost Listing
**Event Type:** `BOOST_LISTING`

#### Detection Logic
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1kj7pasyahtugajx9qud02r5jqaf60mtm7g5v9utr94rmdfftx0vqspf4at",
      token_id: "6748",
      msg: "BASE64_ENCODED"
    }
  },
  action: "launch-nft/setup",
  memo: "www.boostdao.io"
}
```

#### Decode Listing Details
```javascript
function decodeBoostListing(encoded) {
  const decoded = Buffer.from(encoded, 'base64').toString();
  const parsed = JSON.parse(decoded);
  
  return {
    price: parsed.setup?.setup?.nft?.to_amount,
    tokenInfo: parsed.setup?.to_info,  // Can be ANY token
    listingType: parsed.setup?.whitelist ? "private" : "public",
    whitelist: parsed.setup?.whitelist || []
  };
}
```

#### What Explorer Shows
```javascript
{
  emoji: "📋",
  badge: "Boost List",
  explanation: "Listed for sale on Boost marketplace",
  detectionMethod: "Looks for send_nft to Boost with setup message",
  keyIndicator: "Can accept ANY token (LUNA, USDC, arbLUNA, etc.)",
  note: "7% fees if public: 2% protocol + 5% DAO royalty"
}
```

---

### 12. Boost Sale
**Event Type:** `BOOST_SALE`

#### Detection Logic
```javascript
{
  // TWO messages:
  messages: [
    // Message 1: Approve payment token
    { 
      msg: { 
        increase_allowance: {
          spender: BOOST_MARKETPLACE,
          amount: "250000000"
        } 
      } 
    },
    // Message 2: Execute purchase
    { 
      msg: { 
        deposit: { 
          amount: "250000000",
          id: 12345 
        } 
      } 
    }
  ],
  action: "launch-nft/deposit_nft"
}
```

#### What Explorer Shows
```javascript
{
  emoji: "🚀",
  badge: "Boost Sale",
  explanation: "Sale completed on Boost marketplace",
  detectionMethod: "Looks for increase_allowance + deposit messages",
  keyIndicator: "Two-message transaction: token approval then purchase",
  note: "Payment token can be LUNA, USDC, bLUNA, or any other"
}
```

---

## Boost Tools

### 13. Boost Transfer
**Event Type:** `BOOST_TRANSFER`

#### Detection Logic
```javascript
{
  contract: NFT_CONTRACT,
  msg: {
    transfer_nft: {
      recipient: "terra1xyz...",  // NOT marketplace/staking
      token_id: "6748"
    }
  },
  memo: "www.boostdao.io"
}
```

#### Pattern Matching
```javascript
function isBoostTransfer(tx) {
  const msg = tx.body.messages[0]?.msg;
  const recipient = msg?.transfer_nft?.recipient;
  
  // Must be transfer_nft
  if (!msg?.transfer_nft) return false;
  
  // NOT to marketplace
  if (recipient === BBL_MARKETPLACE) return false;
  if (recipient === BOOST_MARKETPLACE) return false;
  
  // NOT to staking
  if (recipient === DAODAO_STAKING) return false;
  
  // HAS Boost memo
  return tx.body.memo === "www.boostdao.io";
}
```

#### What Explorer Shows
```javascript
{
  emoji: "🔄",
  badge: "Boost Xfer",
  explanation: "Wallet-to-wallet transfer via Boost interface",
  detectionMethod: "Looks for transfer_nft with Boost memo, NOT to marketplace",
  keyIndicator: "Memo is 'www.boostdao.io' and recipient is normal wallet",
  note: "Same as manual transfer but initiated through Boost UI"
}
```

---

### 14. Boost Stake
**Event Type:** `BOOST_STAKE`

#### Detection Logic
```javascript
{
  msg: {
    send_nft: {
      contract: DAODAO_STAKING,
      token_id: "6748",
      msg: "eyJzdGFrZSI6e319"
    }
  },
  memo: "www.boostdao.io"
}
```

#### What Explorer Shows
```javascript
{
  emoji: "💎",
  badge: "Boost Stake",
  explanation: "Staked to DAODao via Boost interface",
  detectionMethod: "Looks for stake to DAODao with Boost memo",
  keyIndicator: "Same as manual stake but memo is 'www.boostdao.io'",
  note: "Functionally identical to manual DAODao stake"
}
```

---

### 15. Enterprise Unstake (Legacy Tool)
**Event Type:** `ENTERPRISE_UNSTAKE_BOOST`

#### Detection Logic
```javascript
{
  contract: "terra1e54tcdyulrtslvf79htx4zntqntd4r550cg22sj24r6gfm0anrvq0y8tdv",
  msg: { claim: {} },
  action: "claim",
  memo: "www.boostdao.io"
}
```

#### Extraction Pattern
```javascript
// NFTs ONLY in events, not message
function extractRescuedNFTs(tx) {
  const tokenIds = [];
  tx.events.forEach(event => {
    if (event.type === "wasm") {
      let tokenId, action, sender;
      event.attributes.forEach(attr => {
        if (attr.key === "token_id") tokenId = attr.value;
        if (attr.key === "action") action = attr.value;
        if (attr.key === "sender") sender = attr.value;
      });
      
      // Transfers FROM enterprise tool
      if (action === "transfer_nft" && 
          sender === ENTERPRISE_TOOL_CONTRACT) {
        tokenIds.push(tokenId);
      }
    }
  });
  return [...new Set(tokenIds)];
}
```

#### What Explorer Shows
```javascript
{
  emoji: "🔧",
  badge: "Enterprise",
  explanation: "Legacy: Recover NFTs stuck in old Enterprise DAO",
  detectionMethod: "Looks for claim from Boost Enterprise tool contract",
  keyIndicator: "Multiple NFT transfers FROM Enterprise tool TO owner",
  note: "Cleanup tool - should decrease over time as NFTs are recovered"
}
```

---

## NFT Switch Events

### 16. NFT Switch Batch Transfer
**Event Type:** `NFTSWITCH_BATCH_TRANSFER`

#### Detection Logic
```javascript
{
  // MULTIPLE messages (one per NFT)
  messages: [
    { msg: { transfer_nft: { recipient: "terra1abc...", token_id: "1" } } },
    { msg: { transfer_nft: { recipient: "terra1abc...", token_id: "2" } } },
    { msg: { transfer_nft: { recipient: "terra1abc...", token_id: "3" } } }
  ],
  memo: /NFTSwitch|nftswitch\.xyz/i
}
```

#### Validation
```javascript
function isNFTSwitchBatch(tx) {
  const msgs = tx.body.messages;
  
  // Multiple messages
  if (msgs.length === 1) return false;
  
  // All are transfer_nft
  if (!msgs.every(m => m.msg?.transfer_nft)) return false;
  
  // Same recipient for all
  const recipients = msgs.map(m => m.msg.transfer_nft.recipient);
  if (new Set(recipients).size !== 1) return false;
  
  // NFTSwitch memo
  return /nftswitch/i.test(tx.body.memo);
}
```

#### What Explorer Shows
```javascript
{
  emoji: "📦",
  badge: "Switch Batch",
  explanation: "Multiple NFTs transferred via NFT Switch",
  detectionMethod: "Looks for multiple transfer_nft messages with Switch memo",
  keyIndicator: "All transfers to same recipient + nftswitch memo",
  note: "Can transfer 1 to 100+ NFTs in one transaction"
}
```

---

### 17-19. NFT Switch OTC (Three-Step Process)

#### Step 1: Create
**Event Type:** `NFTSWITCH_OTC_CREATE`

```javascript
{
  messages: [
    // Message 1: Approve escrow
    { msg: { approve: { spender: OTC_CONTRACT, token_id: "6748" } } },
    // Message 2: Create trade
    { msg: { create_trade: {
      buyer_addr: "terra1xyz...",  // Whitelisted buyer
      expires_at: "2025-12-31T23:59:59Z",
      nft_id: "6748",
      sale_price: { amount: "250000000", denom: "uluna" }
    } } }
  ],
  action: "try_create_trade"
}
```

#### Step 2: Confirm
**Event Type:** `NFTSWITCH_OTC_CONFIRM`

```javascript
{
  contract: OTC_CONTRACT,
  msg: {
    confirm_trade: {
      buyer: "terra1xyz...",
      nft_collection: NFT_CONTRACT,
      nft_id: "6748",
      seller_fee_pct: "0.0200",  // 2%
      buyer_fee_pct: "0.0200",   // 2%
      is_confirmed_by_operator: true
    }
  },
  action: "update_fees"
}
```

#### Step 3: Complete
**Event Type:** `NFTSWITCH_OTC_COMPLETE`

```javascript
{
  contract: OTC_CONTRACT,
  msg: {
    execute_trade: {
      buyer: "terra1xyz...",
      nft_collection: NFT_CONTRACT,
      nft_id: "6748"
    }
  },
  funds: [{ amount: "255000000", denom: "uluna" }],  // Base + 2%
  action: "execute_trade"
}
```

#### What Explorer Shows
```javascript
// CREATE
{
  emoji: "📝",
  badge: "OTC Create",
  explanation: "Private sale created - NFT in escrow",
  detectionMethod: "Looks for approve + create_trade messages",
  keyIndicator: "0.1 LUNA escrow fee + whitelisted buyer address",
  note: "Buyer must be specified - not open to public"
}

// CONFIRM
{
  emoji: "✍️",
  badge: "OTC Confirm",
  explanation: "Operator confirms trade terms",
  detectionMethod: "Looks for confirm_trade with fee percentages",
  keyIndicator: "is_confirmed_by_operator: true",
  note: "Sets 2% fee for both buyer and seller (4% total)"
}

// COMPLETE
{
  emoji: "✅",
  badge: "OTC Done",
  explanation: "Trade executed - NFT and payment exchanged",
  detectionMethod: "Looks for execute_trade with funds",
  keyIndicator: "Buyer pays base + 2%, seller receives base - 2%",
  note: "NO DAO royalty - platform gets all 4% commission"
}
```

---

## Direct Transfer

### 20. Manual Transfer
**Event Type:** `TRANSFER`

#### Detection Logic
```javascript
function isManualTransfer(tx) {
  const msg = tx.body.messages[0]?.msg;
  const recipient = msg?.transfer_nft?.recipient;
  const memo = tx.body.memo;
  
  // Must be transfer_nft
  if (!msg?.transfer_nft) return false;
  
  // NOT to any platform
  if (recipient === BBL_MARKETPLACE) return false;
  if (recipient === BOOST_MARKETPLACE) return false;
  if (recipient === DAODAO_STAKING) return false;
  
  // NOT from any tool
  if (memo === "www.boostdao.io") return false;
  if (/nftswitch/i.test(memo)) return false;
  
  return true;  // Pure manual transfer
}
```

#### What Explorer Shows
```javascript
{
  emoji: "📤",
  badge: "Transfer",
  explanation: "Direct wallet-to-wallet NFT transfer",
  detectionMethod: "Looks for transfer_nft NOT to marketplace/staking/tools",
  keyIndicator: "Plain transfer_nft with no special memo or platform",
  note: "Most basic transaction type - no fees except gas"
}
```

---

## Event Detection Summary Table

| Event Type | Contract | Message Type | Memo Required? | Multi-NFT? |
|------------|----------|--------------|----------------|------------|
| Alliance Claim | NFT | `claim_rewards` | No | N/A |
| Claim Failed | NFT | `claim_rewards` (failed) | No | N/A |
| NFT Break | NFT | `break_nft` | No | ❌ Single only |
| DAODao Stake | DAODao | `send_nft` | No | ✅ Can be multiple |
| DAODao Unstake | DAODao | `unstake` | No | ✅ Array format |
| DAODao Claim | DAODao | `claim_nfts` | No | ✅ From events |
| BBL Listing | BBL | `send_nft` | No | ❌ Single only |
| BBL Sale | BBL | `settle` | No | ❌ Single only |
| BBL Delist | BBL | `cancel` | No | ❌ Single only |
| BBL Offer | BBL | `make_collection_offer` | No | N/A (any NFT) |
| Boost Listing | Boost | `send_nft` | Optional | ❌ Single only |
| Boost Sale | Boost | `deposit` | Optional | ❌ Single only |
| Boost Transfer | NFT | `transfer_nft` | ✅ Required | ✅ Can be multiple |
| Boost Stake | DAODao | `send_nft` | ✅ Required | ✅ Can be multiple |
| Enterprise Tool | Enterprise | `claim` | ✅ Required | ✅ From events |
| Switch Batch | NFT | `transfer_nft` (multi) | ✅ Required | ✅ Always multiple |
| Switch OTC Create | Switch | `create_trade` | Optional | ❌ Single only |
| Switch OTC Confirm | Switch | `confirm_trade` | No | ❌ Single only |
| Switch OTC Complete | Switch | `execute_trade` | No | ❌ Single only |
| Manual Transfer | NFT | `transfer_nft` | ❌ Must be empty | ✅ Can be multiple |

---

## Testing Event Detection

To verify event detection is working correctly, use these reference transactions:

```javascript
const TEST_CASES = {
  ALLIANCE_CLAIM: "4B7D9C2BF1F1FF6FB87E9D5B97F3FC0F8F3E2A1B7E5C3D9A6F4B2E8C1A5D7F9B",
  NFT_BREAK: "8E6FC36BC4904963E82F34460B541A0FF681C3917E720E2B0B2B1DE0C8B1906A",
  DAODAO_UNSTAKE: "F1DC0F1958F7598AD4F5FFF2B9F04B88ED0CD1A5022460E3C27CA1CF4B141A1E",
  BBL_SALE: "7F1E3A5C9B2D4F6A8C0E2B5D7F9A1C3E5B7D9F2A4C6E8D1F3A5C7E9B2D4F6A8",
  BOOST_TRANSFER: "CBE0C464C35A9E97DDB790DAA8441F0B3D723F48D143E65974AD3F06E85C48B6",
  NFTSWITCH_BATCH: "4F531C70350410ED8E4B072204CC7FA11ECD1D82E88E4CB73340055D6BBE1107"
};
```

---

## Next: Part 3

Continue to Part 3 for:
- Token Amount Extraction
- Fee Calculation Logic
- Multi-NFT Handling Patterns

---

**GitHub:** Save as `02-event-detection.md`
