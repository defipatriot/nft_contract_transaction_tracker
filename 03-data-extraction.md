# Alliance DAO NFT Transaction Explorer
## Data Extraction & Token Handling

**Version:** 2.0  
**Date:** October 29, 2025  
**Part:** 3 of 5

---

## Overview

This document explains how the Explorer extracts financial data, handles multiple token types, and calculates fees from blockchain transactions. The key challenge is dealing with micro-unit amounts (1 LUNA = 1,000,000 uluna) and multiple payment tokens across different platforms.

---

## Token Amount Extraction

### Micro-Unit Conversion

All blockchain amounts are in micro-units (6 decimals):

```javascript
// Raw blockchain amount
amount: "249000000"  // This is 249 bLUNA

// Convert to human-readable
function formatAmount(microAmount, decimals = 6) {
  return parseFloat(microAmount) / Math.pow(10, decimals);
}

// Usage
formatAmount("249000000")  // Returns: 249
```

### Common Tokens & Denoms

| Token | Denom | Decimals | Contract Address (if CW20) |
|-------|-------|----------|----------------------------|
| LUNA | `uluna` | 6 | Native token |
| bLUNA | `bluna` | 6 | `terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml` |
| ampLUNA | `ampluna` | 6 | `terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct` |
| arbLUNA | `arbluna` | 6 | CW20 contract |
| USDC | `usdc` | 6 | IBC token |
| SOLID | `solid` | 6 | CW20 contract |

### Extraction From Different Sources

#### 1. From Transaction Message (Native Tokens)
```javascript
// Native token in "funds" field
const funds = tx.body.messages[0].funds;
if (funds && funds.length > 0) {
  const amount = funds[0].amount;     // "249000000"
  const denom = funds[0].denom;       // "uluna"
}
```

#### 2. From CW20 Transfer Events
```javascript
// CW20 tokens appear in events
function extractCW20Amount(tx) {
  for (const event of tx.events) {
    if (event.type === "wasm") {
      let amount, contract, action;
      
      event.attributes.forEach(attr => {
        if (attr.key === "amount") amount = attr.value;
        if (attr.key === "_contract_address") contract = attr.value;
        if (attr.key === "action") action = attr.value;
      });
      
      if (action === "transfer" && amount) {
        return {
          amount: amount,
          contract: contract,
          token: resolveTokenName(contract)
        };
      }
    }
  }
  return null;
}
```

#### 3. From Base64 Encoded Messages
```javascript
// BBL and Boost encode listing details
function decodeListingAmount(msg) {
  const encoded = msg.send_nft?.msg;
  if (!encoded) return null;
  
  try {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const parsed = JSON.parse(decoded);
    
    // BBL format
    if (parsed.list?.amount) {
      return {
        amount: parsed.list.amount,
        token: "bLUNA"  // BBL is always bLUNA
      };
    }
    
    // Boost format (variable token)
    if (parsed.setup?.setup?.nft?.to_amount) {
      return {
        amount: parsed.setup.setup.nft.to_amount,
        tokenInfo: parsed.setup.to_info  // Contains token details
      };
    }
  } catch (e) {
    console.error("Failed to decode:", e);
    return null;
  }
}
```

---

## Token Logo Detection & Display

### Current Token Prefix Problem

**CRITICAL BUG FIX:** The explorer was showing "249 LUNA" instead of "249 bLUNA" because token prefixes weren't properly detected.

### Solution: Smart Token Detection

```javascript
function detectTokenType(amount, tx, eventType) {
  // 1. Check message funds first (native tokens)
  const funds = tx.body.messages[0]?.funds;
  if (funds && funds.length > 0) {
    const denom = funds[0].denom;
    if (denom === "uluna") return { token: "LUNA", logo: "🌙" };
    if (denom.includes("bluna")) return { token: "bLUNA", logo: "🔵" };
  }
  
  // 2. Check CW20 transfers in events
  for (const event of tx.events) {
    if (event.type === "wasm") {
      let contract, action;
      event.attributes.forEach(attr => {
        if (attr.key === "_contract_address") contract = attr.value;
        if (attr.key === "action") action = attr.value;
      });
      
      if (action === "transfer") {
        // bLUNA contract
        if (contract === "terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml") {
          return { token: "bLUNA", logo: "🔵" };
        }
        // ampLUNA contract
        if (contract === "terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct") {
          return { token: "ampLUNA", logo: "📊" };
        }
        // arbLUNA contract
        if (contract === "terra1...") {  // arbLUNA address
          return { token: "arbLUNA", logo: "🔷" };
        }
      }
    }
  }
  
  // 3. Platform-specific defaults
  if (eventType.includes("BBL")) {
    return { token: "bLUNA", logo: "🔵" };  // BBL is ALWAYS bLUNA
  }
  
  if (eventType.includes("ALLIANCE") || eventType.includes("BREAK")) {
    return { token: "ampLUNA", logo: "📊" };  // Rewards are always ampLUNA
  }
  
  // 4. Fallback
  return { token: "LUNA", logo: "🌙" };
}
```

### Token Logo Mapping

```javascript
const TOKEN_LOGOS = {
  "LUNA": "🌙",
  "bLUNA": "🔵",
  "ampLUNA": "📊",
  "arbLUNA": "🔷",
  "USDC": "💵",
  "SOLID": "💎",
  "EUR": "💶",
  "CAPA": "🎯",
  "ROAR": "🦁",
  "ASTRO": "⭐"
};
```

---

## Fee Extraction Logic

### BBL & Boost Marketplace Fees

Both use the same fee structure:
- **Protocol Fee:** 2% to marketplace
- **DAO Royalty:** 5% to Alliance DAO treasury
- **Seller Proceeds:** 93% to seller
- **Total:** 7% fees

#### Extraction Pattern

```javascript
function extractMarketplaceFees(tx, platform) {
  const fees = {
    protocolFee: null,
    protocolFeeRecipient: null,
    royaltyFee: null,
    royaltyFeeRecipient: null,
    sellerProceeds: null,
    sellerProceedsRecipient: null,
    totalSalePrice: null
  };
  
  // Method 1: Try event attributes first (most reliable)
  const eventFees = extractFeesFromEvents(tx);
  if (eventFees.protocolFee) {
    fees.protocolFee = parseInt(eventFees.protocolFee);
    fees.royaltyFee = parseInt(eventFees.royaltyFee);
    fees.sellerProceeds = parseInt(eventFees.sellerProceeds);
    fees.totalSalePrice = fees.protocolFee + fees.royaltyFee + fees.sellerProceeds;
    return fees;
  }
  
  // Method 2: Extract from transfer events
  const transfers = extractTransfers(tx);
  
  // Sort by amount (smallest to largest)
  transfers.sort((a, b) => a.amount - b.amount);
  
  if (transfers.length >= 3) {
    // Smallest = 2% protocol fee
    fees.protocolFee = transfers[0].amount;
    fees.protocolFeeRecipient = transfers[0].to;
    
    // Middle = 5% royalty
    fees.royaltyFee = transfers[1].amount;
    fees.royaltyFeeRecipient = transfers[1].to;
    
    // Largest = 93% to seller
    fees.sellerProceeds = transfers[2].amount;
    fees.sellerProceedsRecipient = transfers[2].to;
    
    // Calculate total
    fees.totalSalePrice = fees.protocolFee + fees.royaltyFee + fees.sellerProceeds;
  }
  
  return fees;
}

function extractFeesFromEvents(tx) {
  const fees = {};
  
  tx.events.forEach(event => {
    if (event.type === "wasm") {
      event.attributes.forEach(attr => {
        if (attr.key === "protocol_fee_amount") fees.protocolFee = attr.value;
        if (attr.key === "royalty_amount") fees.royaltyFee = attr.value;
        if (attr.key === "seller_amount") fees.sellerProceeds = attr.value;
      });
    }
  });
  
  return fees;
}

function extractTransfers(tx) {
  const transfers = [];
  
  tx.events.forEach(event => {
    if (event.type === "wasm") {
      let amount, from, to, action;
      
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
```

### NFT Switch OTC Fees

Different structure:
- **Buyer Fee:** 2% (buyer pays base + 2%)
- **Seller Fee:** 2% (seller receives base - 2%)
- **Platform Commission:** 4% total
- **DAO Royalty:** 0% (no royalty)

```javascript
function extractOTCFees(tx) {
  const fees = {
    basePrice: null,
    buyerPaid: null,
    sellerReceived: null,
    platformCommission: null,
    buyerFee: null,
    sellerFee: null
  };
  
  // Extract from funds (what buyer paid)
  const funds = tx.body.messages[0]?.funds;
  if (funds && funds.length > 0) {
    fees.buyerPaid = parseInt(funds[0].amount);
  }
  
  // Extract base price from events
  const transfers = extractTransfers(tx);
  
  // Find transfer to NFT Switch fee wallet
  const commissionTransfer = transfers.find(t => 
    t.to === "terra1qdpyuvy9cjmelly6cf604ck7srpt040nee9cjy"
  );
  
  // Find transfer to seller
  const sellerTransfer = transfers.find(t => 
    t.to !== "terra1qdpyuvy9cjmelly6cf604ck7srpt040nee9cjy" &&
    t.from !== t.to  // Not a self-transfer
  );
  
  if (commissionTransfer) {
    fees.platformCommission = commissionTransfer.amount;
  }
  
  if (sellerTransfer) {
    fees.sellerReceived = sellerTransfer.amount;
  }
  
  // Calculate base price
  if (fees.buyerPaid && fees.platformCommission) {
    fees.basePrice = fees.buyerPaid - (fees.buyerPaid * 0.02);
    fees.buyerFee = fees.buyerPaid * 0.02;
    fees.sellerFee = fees.platformCommission - fees.buyerFee;
  }
  
  return fees;
}
```

---

## Gas Fee Extraction

### Standard Gas Fees

```javascript
function extractGasFees(tx) {
  const authInfo = tx.auth_info;
  
  if (authInfo && authInfo.fee) {
    const feeAmount = authInfo.fee.amount;
    
    if (feeAmount && feeAmount.length > 0) {
      return {
        gasWanted: tx.tx_response.gas_wanted,
        gasUsed: tx.tx_response.gas_used,
        feeAmount: parseInt(feeAmount[0].amount),
        feeDenom: feeAmount[0].denom,
        feeFormatted: formatAmount(feeAmount[0].amount) + " LUNA"
      };
    }
  }
  
  return {
    gasWanted: tx.tx_response.gas_wanted,
    gasUsed: tx.tx_response.gas_used,
    feeAmount: 0,
    feeDenom: "uluna",
    feeFormatted: "0 LUNA"
  };
}
```

### Gas Fee Per NFT (Batch Transactions)

```javascript
function calculateGasPerNFT(tx, nftCount) {
  if (nftCount === 0) return "N/A";
  
  const fees = extractGasFees(tx);
  const feePerNFT = fees.feeAmount / nftCount;
  
  return {
    totalGas: formatAmount(fees.feeAmount) + " LUNA",
    gasPerNFT: formatAmount(feePerNFT) + " LUNA per NFT",
    efficiency: nftCount > 1 ? `${((1 - (1 / nftCount)) * 100).toFixed(1)}% savings` : "N/A"
  };
}
```

---

## Alliance Rewards Extraction

### Daily Claim Structure

```javascript
function extractAllianceRewards(tx) {
  const rewards = {
    totalClaimed: null,
    treasuryFee: null,      // 10%
    holderRewards: null,    // 90%
    rewardToken: "ampLUNA"
  };
  
  // Method 1: From events (most reliable)
  for (const event of tx.events) {
    if (event.type === "wasm") {
      event.attributes.forEach(attr => {
        if (attr.key === "rewards") {
          rewards.totalClaimed = parseInt(attr.value);
        }
        if (attr.key === "amount" && attr.value) {
          // This is the ampLUNA mint amount
          rewards.holderRewards = parseInt(attr.value);
        }
      });
    }
  }
  
  // Calculate breakdown
  if (rewards.totalClaimed) {
    rewards.treasuryFee = rewards.totalClaimed * 0.10;
    rewards.holderRewards = rewards.totalClaimed * 0.90;
  }
  
  return rewards;
}
```

### NFT Break Rewards

```javascript
function extractBreakRewards(tx, tokenId) {
  const rewards = {
    nftId: tokenId,
    rewardsReceived: null,
    userSharePercent: null,
    rewardToken: "ampLUNA"
  };
  
  // Extract from events
  for (const event of tx.events) {
    if (event.type === "wasm") {
      let amount, action, recipient;
      
      event.attributes.forEach(attr => {
        if (attr.key === "amount") amount = attr.value;
        if (attr.key === "action") action = attr.value;
        if (attr.key === "to" || attr.key === "recipient") recipient = attr.value;
      });
      
      // Look for ampLUNA mint to user
      if (action === "mint" && amount && recipient) {
        rewards.rewardsReceived = parseInt(amount);
        rewards.recipient = recipient;
      }
    }
  }
  
  // Calculate share percentage (based on current supply)
  if (rewards.rewardsReceived) {
    const TOTAL_SUPPLY = 10000;  // Total NFTs
    rewards.userSharePercent = ((1 / TOTAL_SUPPLY) * 100).toFixed(4) + "%";
  }
  
  return rewards;
}
```

---

## Multi-NFT Amount Handling

### Scenario: Multiple NFTs with Different Values

Some transactions involve multiple NFTs with different prices:

```javascript
// Example: User sells 3 NFTs on BBL
// NFT #1: 100 bLUNA
// NFT #2: 250 bLUNA  
// NFT #3: 175 bLUNA
// Total: 525 bLUNA

function extractMultiNFTAmounts(tx) {
  const amounts = [];
  
  // Try to find individual amounts in events
  const nftIds = extractTokenIds(tx);
  
  for (const event of tx.events) {
    if (event.type === "wasm") {
      let tokenId, amount, action;
      
      event.attributes.forEach(attr => {
        if (attr.key === "token_id") tokenId = attr.value;
        if (attr.key === "amount") amount = attr.value;
        if (attr.key === "action") action = attr.value;
      });
      
      if (action === "transfer" && tokenId && amount) {
        amounts.push({
          tokenId: tokenId,
          amount: parseInt(amount),
          amountFormatted: formatAmount(amount)
        });
      }
    }
  }
  
  // If can't find individual amounts, show total
  if (amounts.length === 0) {
    const totalAmount = extractTotalAmount(tx);
    return {
      type: "aggregate",
      total: totalAmount,
      perNFT: totalAmount / nftIds.length
    };
  }
  
  return {
    type: "individual",
    amounts: amounts
  };
}
```

---

## Currency Conversion System

### Three Display Modes

The explorer supports three currency display modes:

#### 1. Token Mode (Default)
```javascript
// Show original token
amount: "249000000",
token: "bLUNA"
// Display: "249 bLUNA"
```

#### 2. LUNA Mode
```javascript
// Convert to LUNA equivalent
const prices = {
  "bLUNA": 0.98,  // bLUNA/LUNA ratio
  "ampLUNA": 1.05  // ampLUNA/LUNA ratio
};

function convertToLUNA(amount, token) {
  const amountFormatted = formatAmount(amount);
  const ratio = prices[token] || 1;
  return amountFormatted * ratio;
}

// 249 bLUNA * 0.98 = 244.02 LUNA
// Display: "244.02 LUNA"
```

#### 3. USD Mode
```javascript
// Convert to USD
const prices = {
  "LUNA": 5.25,
  "bLUNA": 5.15,
  "ampLUNA": 5.51
};

function convertToUSD(amount, token) {
  const amountFormatted = formatAmount(amount);
  const usdPrice = prices[token] || 0;
  return (amountFormatted * usdPrice).toFixed(2);
}

// 249 bLUNA * $5.15 = $1,282.35
// Display: "$1,282.35 USD"
```

### Click to See All Values

```javascript
function showAllCurrencyValues(amount, token) {
  const amountFormatted = formatAmount(amount);
  const lunaValue = convertToLUNA(amount, token);
  const usdValue = convertToUSD(amount, token);
  
  return {
    original: `${amountFormatted} ${token}`,
    luna: `${lunaValue.toFixed(2)} LUNA`,
    usd: `$${usdValue} USD`
  };
}

// Popup shows:
// Original: 249 bLUNA
// LUNA Equivalent: 244.02 LUNA
// USD Value: $1,282.35 USD
```

---

## Price Data Sources

### CoinGecko Integration

```javascript
const COINGECKO_IDS = {
  "terra-luna-2": "LUNA",
  "bonded-luna": "bLUNA",
  "eris-amplified-luna": "ampLUNA",
  "arbitrage-protocol": "arbLUNA",
  "solid-vaults": "SOLID",
  "usd-coin": "USDC"
};

async function fetchTokenPrices() {
  const ids = Object.keys(COINGECKO_IDS).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    const prices = {};
    for (const [id, symbol] of Object.entries(COINGECKO_IDS)) {
      if (data[id] && data[id].usd) {
        prices[symbol] = data[id].usd;
      }
    }
    
    return prices;
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return {};
  }
}
```

### Rate Limiting Strategy

```javascript
// Only call CoinGecko once on page load
let cachedPrices = null;
let lastFetchTime = null;

async function getPrices() {
  const now = Date.now();
  const CACHE_DURATION = 60000;  // 1 minute
  
  if (cachedPrices && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedPrices;
  }
  
  cachedPrices = await fetchTokenPrices();
  lastFetchTime = now;
  return cachedPrices;
}
```

---

## Data Validation

### Amount Sanity Checks

```javascript
function validateAmount(amount, token, eventType) {
  const warnings = [];
  
  // Check for extremely large amounts
  const formatted = formatAmount(amount);
  if (formatted > 1000000) {
    warnings.push("⚠️ Unusually large amount - verify accuracy");
  }
  
  // Check for zero amounts where they shouldn't be
  if (formatted === 0 && eventType.includes("SALE")) {
    warnings.push("⚠️ Zero sale price detected");
  }
  
  // Check token makes sense for platform
  if (eventType.includes("BBL") && token !== "bLUNA") {
    warnings.push("⚠️ BBL should only use bLUNA");
  }
  
  // Check rewards amounts
  if (eventType === "ALLIANCE_CLAIM" && formatted < 1) {
    warnings.push("⚠️ Very low reward amount - check if this is correct");
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}
```

---

## Error Handling

### Missing Data Fallbacks

```javascript
function safeExtractAmount(tx, eventType) {
  try {
    // Try multiple extraction methods
    let amount = extractFromMessage(tx);
    if (!amount) amount = extractFromEvents(tx);
    if (!amount) amount = extractFromTransfers(tx);
    
    if (!amount) {
      console.warn(`No amount found for ${eventType} in tx ${tx.hash}`);
      return {
        amount: "0",
        token: "LUNA",
        error: "Amount not found"
      };
    }
    
    return amount;
  } catch (error) {
    console.error("Error extracting amount:", error);
    return {
      amount: "0",
      token: "LUNA",
      error: error.message
    };
  }
}
```

---

## Next: Part 4

Continue to Part 4 for:
- Complete Address Directory
- Human-Readable Address Resolution
- Pattern Matching Code Examples

---

**GitHub:** Save as `03-data-extraction.md`
