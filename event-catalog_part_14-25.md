# AllianceDAO NFT Transaction Tracker - Part 3
## Event Catalog (Events 14-25)

**Version:** 1.0  
**Date:** October 16, 2025  
**Part:** 3 of 5

---

## 14. Boost Transfer

**Event ID:** `BOOST_TRANSFER`  
**Reference TX:** `CBE0C464C35A9E97DDB790DAA8441F0B3D723F48D143E65974AD3F06E85C48B6`

### Identifiers
```javascript
{
  contract: NFT_CONTRACT,
  msg: {
    transfer_nft: {
      recipient: string,
      token_id: string
    }
  },
  action: "transfer_nft",
  memo: "www.boostdao.io"
}
```

### Data Structure
```javascript
{
  eventType: "BOOST_TRANSFER",
  tokenId: string,                  // SINGLE only
  platform: "Boost",
  transferType: "single",
  sender: string,
  recipient: string,
  gasFeePaid: number
}
```

### Scalability
- ✅ ALWAYS single NFT (Boost doesn't batch)
- ⚠️ Distinguish from marketplace by recipient

---

## 15. Boost Stake

**Event ID:** `BOOST_STAKE_DAODAO`  
**Reference TX:** `CF5FF46887522CD918487FE249AC557A247324E6BB944842961B9113AAA8FD7F`

### Identifiers
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1c57ur376...",  // DAODao
      token_id: string,
      msg: "eyJzdGFrZSI6e319"
    }
  },
  action: "stake",
  memo: "www.boostdao.io"
}
```

### Data Structure
```javascript
{
  eventType: "BOOST_STAKE_DAODAO",
  tokenIds: [string],               // Can be multiple
  nftCount: number,
  platform: "Boost",
  staker: string
}
```

### Scalability
- ⚠️ CAN have multiple messages
- ✅ Same as manual stake, just via Boost UI

---

## 16. Enterprise Unstake (Boost Tool)

**Event ID:** `ENTERPRISE_UNSTAKE_BOOST`  
**Reference TX:** `7A0DC4FEA2238E56AE21738DE158BA775B884BB13C05DC96488E6CF3BEE08C0A`

### Identifiers
```javascript
{
  contract: "terra1e54tcdyu...",    // Boost tool
  msg: { claim: {} },
  action: "claim",
  memo: "www.boostdao.io"
  // Multiple NFT transfers in events
}
```

### Data Structure
```javascript
{
  eventType: "ENTERPRISE_UNSTAKE_BOOST",
  tokenIds: [string],               // From events
  nftCount: number,
  platform: "Boost",
  toolType: "Enterprise Recovery",
  recipient: string,
  gasPerNFT: number
}
```

### Scalability
- ⚠️ NFT IDs only in events
- ✅ Can rescue multiple at once
- 📊 Legacy cleanup (decreasing over time)

### Extraction Pattern
```javascript
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
      if (action === "transfer_nft" && 
          sender === BOOST_ENTERPRISE_TOOL_CONTRACT) {
        tokenIds.push(tokenId);
      }
    }
  });
  return [...new Set(tokenIds)];
}
```

---

## 17. NFT Switch Batch Transfer

**Event ID:** `NFTSWITCH_BATCH_TRANSFER`  
**Reference TX:** `4F531C70350410ED8E4B072204CC7FA11ECD1D82E88E4CB73340055D6BBE1107`

### Identifiers
```javascript
{
  // MULTIPLE messages
  messages: [
    { msg: { transfer_nft: {...} } },
    { msg: { transfer_nft: {...} } },
    // ... more
  ],
  memo: /NFTSwitch|nftswitch\.xyz/i
  // All same recipient
}
```

### Data Structure
```javascript
{
  eventType: "NFTSWITCH_BATCH_TRANSFER",
  tokenIds: [string],               // From ALL messages
  nftCount: number,
  platform: "NFT Switch",
  transferType: "batch",
  sender: string,
  recipient: string,                // Same for all
  gasPerNFT: number
}
```

### Scalability
- ✅ ALWAYS multiple messages (1 per NFT)
- ✅ Can be 1 to 100+ NFTs
- 📊 Track batch size distribution

### Extraction Pattern
```javascript
function isNFTSwitchBatchTransfer(tx) {
  const msgs = tx.body.messages;
  
  // Multiple messages
  if (msgs.length === 1) return false;
  
  // All transfer_nft
  if (!msgs.every(m => m.msg?.transfer_nft)) return false;
  
  // Same recipient for all
  const recipients = msgs.map(m => m.msg.transfer_nft.recipient);
  if (new Set(recipients).size !== 1) return false;
  
  // NFTSwitch memo
  return /nftswitch/i.test(tx.body.memo);
}

function extractBatchNFTs(tx) {
  return tx.body.messages
    .filter(msg => msg.msg?.transfer_nft)
    .map(msg => msg.msg.transfer_nft.token_id);
}
```

---

## 18. NFT Switch OTC Create

**Event ID:** `NFTSWITCH_OTC_CREATE`  
**Reference TX:** `8B508B970A9F30163B229BD35556AC6307388F364FEDD1655DD574BEE28A084C`

### Identifiers
```javascript
{
  // Message 1: Approve NFT
  msg: {
    approve: {
      spender: "terra1wm7rag4feq...",
      token_id: string
    }
  },
  
  // Message 2: Create trade
  msg: {
    create_trade: {
      buyer_addr: string,
      expires_at: string,
      nft_id: string,
      sale_price: { amount, denom }
    }
  },
  
  action: "try_create_trade"
}
```

### Data Structure
```javascript
{
  eventType: "NFTSWITCH_OTC_CREATE",
  tokenId: string,                  // Single NFT
  platform: "NFT Switch",
  salePrice: string,
  paymentToken: string,
  seller: string,
  buyer: string,                    // Whitelisted
  escrowFee: "100000",              // 0.1 LUNA
  expiresAt: ISO8601,
  status: "pending"
}
```

### Scalability
- ✅ Always single NFT
- ⚠️ Two-message transaction
- 📊 Track OTC volume

---

## 19. NFT Switch OTC Confirm

**Event ID:** `NFTSWITCH_OTC_CONFIRM`  
**Reference TX:** `DB7CA47ACB0A3DE4CD9FFBC15A5DD3B9BA1D63EBBD146EAB2EF98587843F98A5`

### Identifiers
```javascript
{
  contract: "terra1wm7rag4feq...",
  msg: {
    confirm_trade: {
      buyer: string,
      nft_collection: string,
      nft_id: string,
      seller_fee_pct: "0.0200",
      buyer_fee_pct: "0.0200",
      is_confirmed_by_operator: true
    }
  },
  action: "update_fees"
}
```

### Data Structure
```javascript
{
  eventType: "NFTSWITCH_OTC_CONFIRM",
  tokenId: string,
  buyer: string,
  seller: string,
  sellerFeePct: "0.0200",           // 2%
  buyerFeePct: "0.0200",            // 2%
  operator: string,
  status: "confirmed"
}
```

### Scalability
- ✅ Single NFT
- ⚠️ Operator pays gas

---

## 20. NFT Switch OTC Complete

**Event ID:** `NFTSWITCH_OTC_COMPLETE`  
**Reference TX:** `33B7855558853055EF4AF1C5BB768FB216D54349BD6773CD7BD2020C71DEAE08`

### Identifiers
```javascript
{
  contract: "terra1wm7rag4feq...",
  msg: {
    execute_trade: {
      buyer: string,
      nft_collection: string,
      nft_id: string
    }
  },
  funds: [{ amount, denom }],       // Payment
  action: "execute_trade"
}
```

### Data Structure
```javascript
{
  eventType: "NFTSWITCH_OTC_COMPLETE",
  tokenId: string,
  basePrice: string,
  buyerPaid: string,                // base + 2%
  sellerReceived: string,           // base - 2%
  platformCommission: string,       // 4% total
  buyerFee: string,                 // 2%
  sellerFee: string,                // 2%
  buyer: string,
  seller: string,
  status: "complete"
}
```

### Scalability
- ✅ Single NFT
- ⚠️ Payment in funds field
- ⚠️ Extract fee breakdown from events
- 📊 Track 4% total fee (both sides pay)

### Complete OTC Flow
```
Transaction 1: Create (8B508B97...)
  ├─ Seller approves NFT
  ├─ Pays 0.1 LUNA escrow
  └─ Status: Pending

Transaction 2: Confirm (DB7CA47A...)
  ├─ Operator confirms trade
  └─ Status: Confirmed

Transaction 3: Complete (33B78555...)
  ├─ Buyer pays (base + 2%)
  ├─ Seller gets (base - 2%)
  ├─ Platform gets 4%
  └─ Status: Complete
```

---

## 21. P2P Transfer (Manual)

**Event ID:** `P2P_TRANSFER`  
**Reference TX:** `1C3E5B7D9F2A4C6E8D0F1B3A5C7E9D2F4B6A8C0E2D5F7A9C1E3B5D7F9A2C4E6`

### Identifiers
```javascript
{
  contract: NFT_CONTRACT,
  msg: {
    transfer_nft: {
      recipient: string,
      token_id: string
    }
  },
  action: "transfer_nft",
  memo: ""                          // NOT Boost/NFTSwitch
  // Recipient NOT marketplace/staking
}
```

### Data Structure
```javascript
{
  eventType: "P2P_TRANSFER",
  tokenId: string,                  // Usually single
  transferType: "manual",
  sender: string,
  recipient: string,
  gasFeePaid: number
}
```

### Scalability
- ⚠️ Could be single or multiple messages
- ⚠️ Distinguish from tools by memo

### Pattern Matching
```javascript
function isP2PTransfer(tx) {
  const msg = tx.body.messages[0]?.msg;
  const memo = tx.body.memo;
  const recipient = msg?.transfer_nft?.recipient;
  
  // transfer_nft message
  if (!msg?.transfer_nft) return false;
  
  // NOT to marketplace or staking
  if (recipient === BBL_MARKETPLACE_CONTRACT) return false;
  if (recipient === BOOST_MARKETPLACE_CONTRACT) return false;
  if (recipient === DAODAO_STAKING_CONTRACT) return false;
  
  // NOT Boost or NFT Switch tool
  if (memo === "www.boostdao.io") return false;
  if (/nftswitch/i.test(memo)) return false;
  
  return true;
}
```

---

## Summary: Multi-NFT Support

| Event Type | Single/Multiple | Format | Extraction Method |
|------------|-----------------|--------|-------------------|
| NFT Break | ✅ Single only | String | `msg.break_nft` |
| DAODao Stake | ⚠️ Can be multiple | String per message | Loop messages |
| DAODao Unstake | ✅ Multiple | Array | `msg.unstake.token_ids` |
| DAODao Claim | ✅ Multiple | Events only | Parse events |
| BBL Listing/Sale | ✅ Single only | String | `msg.send_nft.token_id` |
| Boost Listing/Sale | ✅ Single only | String | `msg.send_nft.token_id` |
| Boost Transfer | ✅ Single only | String | `msg.transfer_nft.token_id` |
| NFT Switch Batch | ✅ Multiple | String per message | Loop messages |
| Enterprise Unstake | ✅ Multiple | Events only | Parse events |
| P2P Transfer | ⚠️ Can be multiple | String per message | Loop messages |

---

## Fee Structures Comparison

| Platform | Seller Fee | Buyer Fee | DAO Royalty | Total | Notes |
|----------|-----------|-----------|-------------|-------|-------|
| **BBL** | 2% | 0% | 5% | 7% | bLUNA only |
| **Boost** | 2% | 0% | 5% | 7% | Any token |
| **NFT Switch** | 2% | 2% | 0% | 4% | Both sides pay |

### Revenue Example (100 LUNA Sale)

**BBL/Boost:**
```
Sale Price: 100 LUNA
├─ Protocol (2%): 2 LUNA → Marketplace
├─ DAO Royalty (5%): 5 LUNA → Treasury
└─ Seller: 93 LUNA

DAO gets: 5 LUNA
```

**NFT Switch OTC:**
```
Base Price: 100 LUNA
Buyer pays: 102 LUNA (100 + 2%)
Seller gets: 98 LUNA (100 - 2%)
├─ Platform: 4 LUNA
└─ DAO gets: 0 LUNA (no royalty)
```

---

## Universal NFT Extractor Code

```javascript
class NFTExtractor {
  extractAllNFTs(tx, eventType) {
    const nfts = new Map();
    
    // Method 1: From messages
    tx.body.messages.forEach((msg, index) => {
      // Single token_id (string)
      if (msg.msg?.transfer_nft?.token_id) {
        nfts.set(msg.msg.transfer_nft.token_id, {
          tokenId: msg.msg.transfer_nft.token_id,
          source: "message",
          messageIndex: index
        });
      }
      
      // break_nft (string)
      if (msg.msg?.break_nft) {
        nfts.set(msg.msg.break_nft, {
          tokenId: msg.msg.break_nft,
          source: "message",
          messageIndex: index
        });
      }
      
      // Array of token_ids
      if (msg.msg?.unstake?.token_ids) {
        msg.msg.unstake.token_ids.forEach(id => {
          nfts.set(id, {
            tokenId: id,
            source: "message",
            messageIndex: index
          });
        });
      }
      
      // send_nft
      if (msg.msg?.send_nft?.token_id) {
        nfts.set(msg.msg.send_nft.token_id, {
          tokenId: msg.msg.send_nft.token_id,
          source: "message",
          messageIndex: index
        });
      }
    });
    
    // Method 2: From events
    tx.events.forEach((event, eventIndex) => {
      if (event.type === "wasm") {
        let tokenId = null;
        let action = null;
        
        event.attributes.forEach(attr => {
          if (attr.key === "token_id") tokenId = attr.value;
          if (attr.key === "action") action = attr.value;
        });
        
        if (tokenId && this.isRelevantAction(action, eventType)) {
          nfts.set(tokenId, {
            tokenId,
            source: "event",
            eventIndex,
            action
          });
        }
      }
    });
    
    return Array.from(nfts.values());
  }
  
  isRelevantAction(action, eventType) {
    const relevantActions = {
      "DAODAO_CLAIM_NFTS": ["claim_nfts", "transfer_nft"],
      "BBL_SALE": ["settle", "transfer_nft"],
      "BOOST_SALE": ["deposit_nft", "transfer_nft"],
      "ENTERPRISE_UNSTAKE_BOOST": ["claim", "transfer_nft"]
    };
    
    const actions = relevantActions[eventType] || [];
    return actions.includes(action);
  }
  
  getTokenIds(tx, eventType) {
    return this.extractAllNFTs(tx, eventType).map(nft => nft.tokenId);
  }
  
  getCount(tx, eventType) {
    return this.extractAllNFTs(tx, eventType).length;
  }
}
```

---

## Next: Part 4

Continue to Part 4 for:
- Complete Address Directory
- Master Transaction Classifier Code
- Fee Extraction Logic

---

**GitHub:** Save as `03-event-catalog-part-b.md`