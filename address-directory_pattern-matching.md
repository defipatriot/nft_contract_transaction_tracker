# AllianceDAO NFT Transaction Tracker - Part 4
## Address Directory & Pattern Matching Code

**Version:** 1.0  
**Date:** October 16, 2025  
**Part:** 4 of 5

---

## Complete Address Directory

### Core Contracts

| Address | Label | Purpose | Type |
|---------|-------|---------|------|
| `terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9` | aDAO NFT Contract | Main NFT collection (10,000 supply) | NFT |
| `terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct` | ampLUNA Token | Reward token from Alliance staking | CW20 |

### DAODao Governance

| Address | Label | Purpose |
|---------|-------|---------|
| `terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47` | DAODao Staking Contract | Holds staked NFTs for governance |
| `terra14gv57x9lmuc04jzsmsz5f2heyfxfndey2v8hkkjt7z9p6d7xw35stx69j2` | DAODao Voting Contract | Tracks voting power |

### BBL Marketplace (Necropolis)

| Address | Label | Purpose |
|---------|-------|---------|
| `terra1ej4cv98e9g2zjefr5auf2nwtq4xl3dm7x0qml58yna2ml2hk595s7gccs9` | BBL Marketplace | Listing/sales in bLUNA only |
| `terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml` | bLUNA Token | BBL payment token |

### Boost Marketplace (LaunchNFT)

| Address | Label | Purpose |
|---------|-------|---------|
| `terra1kj7pasyahtugajx9qud02r5jqaf60mtm7g5v9utr94rmdfftx0vqspf4at` | Boost Marketplace | Multi-token marketplace |
| `terra1rppeahhmtvy4fs9xr9zkjrf4xs9ak4ygy62slq` | Boost Protocol Fee Wallet | Receives 2% marketplace fee |

### Boost Tools

| Address | Label | Purpose |
|---------|-------|---------|
| `terra1e54tcdyulrtslvf79htx4zntqntd4r550cg22sj24r6gfm0anrvq0y8tdv` | Boost Enterprise Tool | Legacy NFT rescue from Enterprise DAO |

### NFT Switch

| Address | Label | Purpose |
|---------|-------|---------|
| `terra1wm7rag4feqm2w3qfj85gsmn3g38mlxtfvu7zmsydnd8ez3dlkdks0n8yk0` | NFT Switch OTC Contract | Private trades escrow |
| `terra1hkqq2sy3dvvgt8sw2h0nfc3nzufa27d3xj69cf` | NFT Switch Operator | OTC confirmation & escrow |
| `terra1qdpyuvy9cjmelly6cf604ck7srpt040nee9cjy` | NFT Switch Fee Wallet | Receives 4% OTC fees |

### DAO Treasury

| Address | Label | Purpose |
|---------|-------|---------|
| `terra1sffd4efk2jpdt894r04qwmtjqrrjfc52tmj6vkzjxqhd8qqu2drs3m5vzm` | DAO Treasury | Receives 5% royalty from BBL/Boost sales |

---

## Master Transaction Classifier

```javascript
class TransactionClassifier {
  constructor() {
    // Core contracts
    this.NFT_CONTRACT = "terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9";
    this.AMPLUNA_TOKEN = "terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct";
    
    // Governance
    this.DAODAO_STAKING = "terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47";
    this.DAODAO_VOTING = "terra14gv57x9lmuc04jzsmsz5f2heyfxfndey2v8hkkjt7z9p6d7xw35stx69j2";
    
    // Marketplaces
    this.BBL_MARKETPLACE = "terra1ej4cv98e9g2zjefr5auf2nwtq4xl3dm7x0qml58yna2ml2hk595s7gccs9";
    this.BOOST_MARKETPLACE = "terra1kj7pasyahtugajx9qud02r5jqaf60mtm7g5v9utr94rmdfftx0vqspf4at";
    
    // Tools
    this.OTC_CONTRACT = "terra1wm7rag4feqm2w3qfj85gsmn3g38mlxtfvu7zmsydnd8ez3dlkdks0n8yk0";
    this.ENTERPRISE_TOOL = "terra1e54tcdyulrtslvf79htx4zntqntd4r550cg22sj24r6gfm0anrvq0y8tdv";
  }
  
  classify(tx) {
    const contract = tx.body.messages[0]?.contract;
    const msg = tx.body.messages[0]?.msg;
    const memo = tx.body.memo;
    const actions = this.extractActions(tx);
    
    // Priority: Most specific to least specific
    
    // 1. NFT Contract actions
    if (contract === this.NFT_CONTRACT) {
      if (msg.claim_rewards) {
        return tx.tx_response.code === 0 ? "ALLY_REWARDS_CLAIM" : "ALLY_REWARDS_CLAIM_FAILED";
      }
      
      if (msg.break_nft) return "NFT_BREAK";
      
      if (msg.send_nft) {
        const destination = msg.send_nft.contract;
        const decodedMsg = this.decodeBase64(msg.send_nft.msg);
        
        if (destination === this.DAODAO_STAKING && decodedMsg?.stake) {
          return memo === "www.boostdao.io" ? "BOOST_STAKE_DAODAO" : "DAODAO_STAKE";
        }
        
        if (destination === this.BBL_MARKETPLACE) return "BBL_LISTING";
        if (destination === this.BOOST_MARKETPLACE) return "BOOST_LISTING";
      }
      
      if (msg.transfer_nft) {
        const recipient = msg.transfer_nft.recipient;
        
        // Not to marketplace/staking = P2P transfer
        if (recipient !== this.BBL_MARKETPLACE && 
            recipient !== this.BOOST_MARKETPLACE &&
            recipient !== this.DAODAO_STAKING) {
          
          if (memo === "www.boostdao.io") return "BOOST_TRANSFER";
          if (/nftswitch/i.test(memo) && tx.body.messages.length > 1) {
            return "NFTSWITCH_BATCH_TRANSFER";
          }
          return "P2P_TRANSFER";
        }
      }
      
      if (msg.approve) {
        // Check if next message is OTC create
        if (tx.body.messages[1]?.msg?.create_trade) {
          return "NFTSWITCH_OTC_CREATE";
        }
      }
    }
    
    // 2. DAODao actions
    if (contract === this.DAODAO_STAKING) {
      if (msg.unstake) return "DAODAO_UNSTAKE";
      if (msg.claim_nfts) return "DAODAO_CLAIM_NFTS";
    }
    
    // 3. BBL Marketplace actions
    if (contract === this.BBL_MARKETPLACE) {
      if (msg.settle) return "BBL_SALE";
      if (msg.cancel) return "BBL_CANCEL";
      if (msg.make_collection_offer) return "BBL_COLLECTION_OFFER";
    }
    
    // 4. Boost Marketplace actions
    if (contract === this.BOOST_MARKETPLACE) {
      if (msg.deposit) return "BOOST_SALE";
      if (msg.cancel) return "BOOST_CANCEL";
    }
    
    // 5. NFT Switch OTC actions
    if (contract === this.OTC_CONTRACT) {
      if (msg.create_trade) return "NFTSWITCH_OTC_CREATE";
      if (msg.confirm_trade) return "NFTSWITCH_OTC_CONFIRM";
      if (msg.execute_trade) return "NFTSWITCH_OTC_COMPLETE";
    }
    
    // 6. Boost Enterprise Tool
    if (contract === this.ENTERPRISE_TOOL) {
      if (msg.claim) return "ENTERPRISE_UNSTAKE_BOOST";
    }
    
    // 7. Token contract (Boost sales)
    if (msg.increase_allowance && tx.body.messages[1]?.msg?.deposit) {
      return "BOOST_SALE";
    }
    
    return "UNKNOWN";
  }
  
  extractActions(tx) {
    const actions = [];
    tx.events.forEach(event => {
      if (event.type === "wasm") {
        event.attributes.forEach(attr => {
          if (attr.key === "action") {
            actions.push(attr.value);
          }
        });
      }
    });
    return actions;
  }
  
  decodeBase64(encoded) {
    if (!encoded) return null;
    try {
      const decoded = Buffer.from(encoded, 'base64').toString();
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }
}

// Usage
const classifier = new TransactionClassifier();
const eventType = classifier.classify(transaction);
console.log("Event Type:", eventType);
```

---

## Fee Extractor

```javascript
class FeeExtractor {
  constructor() {
    this.BOOST_FEE_WALLET = "terra1rppeahhmtvy4fs9xr9zkjrf4xs9ak4ygy62slq";
    this.DAO_TREASURY = "terra1sffd4efk2jpdt894r04qwmtjqrrjfc52tmj6vkzjxqhd8qqu2drs3m5vzm";
    this.NFTSWITCH_FEE = "terra1qdpyuvy9cjmelly6cf604ck7srpt040nee9cjy";
  }
  
  extractFees(tx, marketplace) {
    const fees = {
      protocolFee: null,
      protocolFeeRecipient: null,
      royaltyFee: null,
      royaltyFeeRecipient: null,
      sellerProceeds: null,
      sellerProceedsRecipient: null,
      totalSalePrice: null
    };
    
    // Try event attributes first (most reliable)
    const eventFees = this.extractFeesFromEvents(tx);
    if (eventFees.protocolFee) {
      return this.formatEventFees(eventFees);
    }
    
    // Fall back to transfer analysis
    const transfers = this.extractTransfers(tx);
    
    if (marketplace === "BBL" || marketplace === "Boost") {
      // 2% protocol + 5% royalty structure
      transfers.sort((a, b) => a.amount - b.amount);
      
      if (transfers.length >= 3) {
        fees.protocolFee = transfers[0].amount;
        fees.protocolFeeRecipient = transfers[0].to;
        
        fees.royaltyFee = transfers[1].amount;
        fees.royaltyFeeRecipient = transfers[1].to;
        
        fees.sellerProceeds = transfers[2].amount;
        fees.sellerProceedsRecipient = transfers[2].to;
        
        fees.totalSalePrice = fees.protocolFee + fees.royaltyFee + fees.sellerProceeds;
      }
    } else if (marketplace === "NFTSwitch") {
      // 4% total (2% each side)
      const commissionTransfer = transfers.find(t => t.to === this.NFTSWITCH_FEE);
      const sellerTransfer = transfers.find(t => t.to !== this.NFTSWITCH_FEE);
      
      if (commissionTransfer) {
        fees.protocolFee = commissionTransfer.amount;
        fees.protocolFeeRecipient = commissionTransfer.to;
      }
      
      if (sellerTransfer) {
        fees.sellerProceeds = sellerTransfer.amount;
        fees.sellerProceedsRecipient = sellerTransfer.to;
      }
      
      fees.totalSalePrice = fees.sellerProceeds + fees.protocolFee;
      fees.royaltyFee = 0; // No DAO royalty
    }
    
    return fees;
  }
  
  extractFeesFromEvents(tx) {
    const fees = {};
    
    tx.events.forEach(event => {
      if (event.type === "wasm") {
        event.attributes.forEach(attr => {
          if (attr.key === "protocol_fee_amount") fees.protocolFee = attr.value;
          if (attr.key === "royalty_amount") fees.royaltyFee = attr.value;
          if (attr.key === "seller_amount") fees.sellerProceeds = attr.value;
          if (attr.key === "buyer_fee") fees.buyerFee = attr.value;
          if (attr.key === "seller_fee") fees.sellerFee = attr.value;
          if (attr.key === "commission") fees.commission = attr.value;
        });
      }
    });
    
    return fees;
  }
  
  extractTransfers(tx) {
    const transfers = [];
    
    tx.events.forEach(event => {
      if (event.type === "wasm") {
        let amount = null;
        let from = null;
        let to = null;
        let action = null;
        
        event.attributes.forEach(attr => {
          if (attr.key === "amount") amount = attr.value;
          if (attr.key === "from") from = attr.value;
          if (attr.key === "to") to = attr.value;
          if (attr.key === "action") action = attr.value;
        });
        
        if (action === "transfer" && amount && from && to) {
          transfers.push({ 
            amount: parseInt(amount), 
            from, 
            to 
          });
        }
      }
    });
    
    return transfers;
  }
  
  formatEventFees(eventFees) {
    return {
      protocolFee: parseInt(eventFees.protocolFee || 0),
      royaltyFee: parseInt(eventFees.royaltyFee || 0),
      sellerProceeds: parseInt(eventFees.sellerProceeds || 0),
      buyerFee: parseInt(eventFees.buyerFee || 0),
      sellerFee: parseInt(eventFees.sellerFee || 0),
      commission: parseInt(eventFees.commission || 0)
    };
  }
}

// Usage
const feeExtractor = new FeeExtractor();
const fees = feeExtractor.extractFees(transaction, "BBL");
console.log("Fees:", fees);
```

---

## Transaction Validator

```javascript
class TransactionValidator {
  validate(tx, eventType) {
    const errors = [];
    const warnings = [];
    
    // Basic structure
    if (!tx.tx_response?.txhash) {
      errors.push("Missing transaction hash");
    }
    
    if (!tx.tx_response?.timestamp) {
      errors.push("Missing timestamp");
    }
    
    if (tx.tx_response?.code !== 0) {
      warnings.push(`Transaction failed with code: ${tx.tx_response.code}`);
    }
    
    // NFT extraction
    const nftExtractor = new NFTExtractor();
    const nfts = nftExtractor.extractAllNFTs(tx, eventType);
    
    if (nfts.length === 0 && this.requiresNFTs(eventType)) {
      errors.push(`No NFTs found for event type: ${eventType}`);
    }
    
    // Event-specific validation
    switch(eventType) {
      case "NFT_BREAK":
        if (nfts.length > 1) {
          errors.push("NFT Break must be single NFT only");
        }
        
        const rewards = this.extractFromEvents(tx, "rewards");
        if (!rewards) {
          errors.push("Missing rewards amount");
        }
        break;
        
      case "DAODAO_UNSTAKE":
        const msg = tx.body.messages[0]?.msg;
        if (!msg?.unstake?.token_ids || !Array.isArray(msg.unstake.token_ids)) {
          errors.push("Unstake must have token_ids array");
        }
        break;
        
      case "BBL_SALE":
      case "BOOST_SALE":
        const feeExtractor = new FeeExtractor();
        const fees = feeExtractor.extractFees(tx, eventType.includes("BBL") ? "BBL" : "Boost");
        
        if (!fees.sellerProceeds) {
          errors.push("Missing seller proceeds");
        }
        
        if (!fees.protocolFee) {
          warnings.push("Missing protocol fee");
        }
        
        if (!fees.royaltyFee && eventType === "BBL_SALE") {
          warnings.push("Missing DAO royalty fee");
        }
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  requiresNFTs(eventType) {
    const noNFTEvents = [
      "ALLY_REWARDS_CLAIM",
      "ALLY_REWARDS_CLAIM_FAILED",
      "BBL_COLLECTION_OFFER"
    ];
    return !noNFTEvents.includes(eventType);
  }
  
  extractFromEvents(tx, key) {
    for (const event of tx.events) {
      if (event.type === "wasm") {
        for (const attr of event.attributes) {
          if (attr.key === key) {
            return attr.value;
          }
        }
      }
    }
    return null;
  }
}

// Usage
const validator = new TransactionValidator();
const result = validator.validate(transaction, "NFT_BREAK");
if (!result.valid) {
  console.error("Validation errors:", result.errors);
}
if (result.warnings.length > 0) {
  console.warn("Warnings:", result.warnings);
}
```

---

## Utility Functions

```javascript
// Base64 decoding
function decodeBase64Message(encoded) {
  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Failed to decode base64:", e);
    return null;
  }
}

// Micro to human-readable
function formatAmount(microAmount, decimals = 6) {
  return parseFloat(microAmount) / Math.pow(10, decimals);
}

// Calculate percentages
function calculateFeePercentage(fee, total) {
  return ((fee / total) * 100).toFixed(2);
}

// Deduplicate array
function deduplicateArray(arr) {
  return [...new Set(arr)];
}

// Safe property access
function safeGet(obj, path, defaultValue = null) {
  return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
}
```

---

## Next: Part 5

Continue to Part 5 for:
- Database Schemas
- Analytics Queries
- Reference Transaction Hashes

---

**GitHub:** Save as `04-addresses-and-patterns.md`