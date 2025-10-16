# AllianceDAO NFT Transaction Tracker - Part 2
## Event Catalog (Events 1-13)

**Version:** 1.0  
**Date:** October 16, 2025  
**Part:** 2 of 5

---

## Event Format

Each event includes:
- **Event ID** (database enum)
- **Reference TX Hash** (real example)
- **Primary Identifiers** (how to detect)
- **Data Structure** (what to extract)
- **Scalability Notes** (multi-NFT support)
- **Pattern Matching** (code examples)

---

## 1. ALLY Rewards Claim

**Event ID:** `ALLY_REWARDS_CLAIM`  
**Reference TX:** `4B7D9C2BF1F1FF6FB87E9D5B97F3FC0F8F3E2A1B7E5C3D9A6F4B2E8C1A5D7F9B`  
**Frequency:** Daily (~8:50 AM UTC)

### Identifiers
```javascript
{
  contract: "terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9",
  msg: { claim_rewards: {} },
  action: "claim_rewards"
}
```

### Data Structure
```javascript
{
  eventType: "ALLY_REWARDS_CLAIM",
  txHash: string,
  timestamp: ISO8601,
  rewardsClaimedRaw: string,
  rewardsClaimedFormatted: number,
  rewardToken: "ampLUNA",
  treasuryFee: number,              // 10%
  holderRewards: number,            // 90%
  status: "success",
  gasFeePaid: number
}
```

### Scalability
- ✅ Single transaction per day
- ⚠️ Can fail (see event #2)

---

## 2. ALLY Rewards Claim Failed

**Event ID:** `ALLY_REWARDS_CLAIM_FAILED`  
**Reference TX:** `3A8C5E1D9F2B4A6C8E0D7F3A9B5C1E4D6F8A2C5E7B9D1F3A5C7E9B2D4F6A8C0`

### Identifiers
```javascript
{
  contract: NFT_CONTRACT,
  msg: { claim_rewards: {} },
  code: 5,                          // Non-zero = failed
  codespace: "wasm"
}
```

### Scalability
- ⚠️ Rare but critical to monitor

---

## 3. NFT Break

**Event ID:** `NFT_BREAK`  
**Reference TX:** `8E6FC36BC4904963E82F34460B541A0FF681C3917E720E2B0B2B1DE0C8B1906A`

### Identifiers
```javascript
{
  contract: NFT_CONTRACT,
  msg: { break_nft: "6748" },      // STRING not array
  action: "break_nft"
}
```

### Data Structure
```javascript
{
  eventType: "NFT_BREAK",
  tokenId: string,                  // SINGLE NFT ONLY
  rewardsReceivedRaw: string,
  rewardsReceivedFormatted: number,
  userSharePercent: string,
  recipient: string,
  platform: "Boost" | "Manual"
}
```

### Scalability
- ✅ **ALWAYS single NFT** (cannot batch)
- ⚠️ NFT destroyed permanently

---

## 4. DAODao Stake

**Event ID:** `DAODAO_STAKE`  
**Reference TX:** `9A2C4E6B8D0F1A3C5E7B9D2F4A6C8E1D3F5A7C9E2B4D6F8A1C3E5B7D9F2A4C6`

### Identifiers
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1c57ur376...",  // DAODao
      token_id: string,
      msg: "eyJzdGFrZSI6e319"        // {"stake":{}}
    }
  },
  action: "stake"
}
```

### Data Structure
```javascript
{
  eventType: "DAODAO_STAKE",
  tokenIds: [string],               // ARRAY for multiple
  nftCount: number,
  staker: string,
  platform: "Boost" | "Manual"
}
```

### Scalability
- ⚠️ **CAN stake multiple NFTs** - check message count
- ✅ Multiple messages possible

---

## 5. DAODao Unstake

**Event ID:** `DAODAO_UNSTAKE`  
**Reference TX:** `F1DC0F1958F7598AD4F5FFF2B9F04B88ED0CD1A5022460E3C27CA1CF4B141A1E`

### Identifiers
```javascript
{
  contract: "terra1c57ur376...",
  msg: {
    unstake: {
      token_ids: ["1033"]           // ARRAY
    }
  },
  claim_duration: "time: 604800"    // 7 days
}
```

### Data Structure
```javascript
{
  eventType: "DAODAO_UNSTAKE",
  tokenIds: [string],               // ALWAYS ARRAY
  nftCount: number,
  claimDuration: 604800,
  unbondingEnds: ISO8601,
  unstaker: string,
  status: "unbonding"
}
```

### Scalability
- ✅ **ALWAYS ARRAY** format
- ✅ Can unstake multiple at once
- ⚠️ Requires claim after 7 days

---

## 6. DAODao Claim NFTs

**Event ID:** `DAODAO_CLAIM_NFTS`  
**Reference TX:** `CCAFC3C271D2CA944D8CFA4DB668C2E07F3A35705ECB9C65C8894778649CA487`

### Identifiers
```javascript
{
  contract: "terra1c57ur376...",
  msg: { claim_nfts: {} },          // Empty
  action: "claim_nfts"
  // NFT IDs in EVENTS only
}
```

### Data Structure
```javascript
{
  eventType: "DAODAO_CLAIM_NFTS",
  tokenIds: [string],               // From events
  nftCount: number,
  claimer: string,
  gasPerNFT: number
}
```

### Scalability
- ⚠️ **NFT IDs NOT IN MESSAGE** - extract from events
- ✅ Claims ALL unbonded NFTs at once

### Extraction Pattern
```javascript
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
      if (action === "transfer_nft" && 
          sender === DAODAO_STAKING_CONTRACT) {
        tokenIds.push(tokenId);
      }
    }
  });
  return [...new Set(tokenIds)];
}
```

---

## 7. BBL Listing

**Event ID:** `BBL_LISTING`  
**Reference TX:** `5D2F9A3E1C7B4D6F8A0C2E5B7D9F1A3C5E7B9D2F4A6C8E1D3F5A7C9E2B4D6F8`

### Identifiers
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1ej4cv98e...",  // BBL
      token_id: string,
      msg: "base64_encoded"
    }
  },
  action: "create_auction",
  memo: /BackBone Labs/i
}
```

### Data Structure
```javascript
{
  eventType: "BBL_LISTING",
  tokenId: string,                  // Single
  auctionId: string,
  listingPriceFormatted: number,
  priceToken: "bLUNA",              // Always bLUNA
  seller: string,
  expiresAt: ISO8601
}
```

### Scalability
- ✅ Single NFT only
- ⚠️ Decode base64 for price

---

## 8. BBL Sale

**Event ID:** `BBL_SALE`  
**Reference TX:** `7F1E3A5C9B2D4F6A8C0E2B5D7F9A1C3E5B7D9F2A4C6E8D1F3A5C7E9B2D4F6A8`

### Identifiers
```javascript
{
  contract: "terra1ej4cv98e...",
  msg: { settle: { auction_id: string } },
  action: "settle"
}
```

### Data Structure
```javascript
{
  eventType: "BBL_SALE",
  tokenId: string,                  // From events
  auctionId: string,
  salePriceFormatted: number,
  protocolFee: number,              // 2%
  royaltyFee: number,               // 5%
  sellerProceeds: number,           // 93%
  buyer: string,
  seller: string
}
```

### Scalability
- ✅ Single NFT
- ⚠️ Extract NFT ID from events
- ⚠️ Multiple token transfers for fees

---

## 9. BBL Cancel

**Event ID:** `BBL_CANCEL`  
**Reference TX:** `2E4A6C8F0D1B3A5C7E9D2F4B6A8C1E3D5F7A9C2E4B6D8F1A3C5E7B9D2F4A6C8`

### Identifiers
```javascript
{
  contract: "terra1ej4cv98e...",
  msg: { cancel: { auction_id: string } },
  action: "cancel"
}
```

---

## 10. BBL Collection Offer

**Event ID:** `BBL_COLLECTION_OFFER`  
**Reference TX:** `1E7495730D92BB81099D727CC5D5BDEA73EB1F2E114B8D709C068C84BF8D699D`

### Identifiers
```javascript
{
  contract: "terra1ej4cv98e...",
  msg: {
    make_collection_offer: {
      amount: string,
      nft_contract: string
    }
  }
}
```

### Data Structure
```javascript
{
  eventType: "BBL_COLLECTION_OFFER",
  offerId: string,
  offerAmount: number,
  offerToken: "bLUNA",
  bidder: string,
  expiresAt: ISO8601,
  status: "active"
}
```

### Scalability
- ✅ No specific NFT (offer for ANY)

---

## 11. Boost Listing

**Event ID:** `BOOST_LISTING`  
**Reference TX:** `A9EB7B4B3E7DCC05F630861FD985C05B8F123984E5260444ABC54BF81829C65E`

### Identifiers
```javascript
{
  msg: {
    send_nft: {
      contract: "terra1kj7pasy...",  // Boost
      token_id: string,
      msg: "base64_encoded"
    }
  },
  action: "launch-nft/setup",
  memo: "www.boostdao.io"
}
```

### Data Structure
```javascript
{
  eventType: "BOOST_LISTING",
  tokenId: string,
  listingId: string,
  listingType: "public" | "private",
  listingPriceFormatted: number,
  priceToken: string,               // ANY token
  priceTokenIBC: string,            // If IBC
  whitelistAddresses: [string],     // If private
  seller: string
}
```

### Scalability
- ✅ Single NFT
- ⚠️ Decode base64
- ⚠️ Payment token varies

### Decode Example
```javascript
function decodeBoostListing(encoded) {
  const decoded = Buffer.from(encoded, 'base64').toString();
  const parsed = JSON.parse(decoded);
  return {
    price: parsed.setup?.setup?.nft?.to_amount,
    tokenInfo: parsed.setup?.to_info,
    whitelist: parsed.setup?.whitelist || []
  };
}
```

---

## 12. Boost Sale

**Event ID:** `BOOST_SALE`  
**Reference TX:** `0FDEC734435950A3DE58D7E9AA8B2D4AE0949DC49BFA55590530D8D102E07B79`

### Identifiers
```javascript
{
  // Two messages
  messages: [
    { msg: { increase_allowance: {...} } },
    { msg: { deposit: { amount, id } } }
  ],
  action: "launch-nft/deposit_nft"
}
```

### Data Structure
```javascript
{
  eventType: "BOOST_SALE",
  tokenId: string,                  // From events
  listingId: string,
  salePriceFormatted: number,
  paymentToken: string,             // Variable
  protocolFee: number,              // 2%
  royaltyFee: number,               // 5%
  sellerProceeds: number,           // 93%
  buyer: string,
  seller: string
}
```

### Scalability
- ⚠️ Two-message transaction
- ⚠️ Extract NFT ID from events
- ⚠️ Payment token varies

---

## 13. Boost Cancel

**Event ID:** `BOOST_CANCEL`  
**Reference TX:** `E6127D14310072123B59E814DD0C9008975EAFA5795D1ECB22C3B56C23BB72A3`

### Identifiers
```javascript
{
  contract: "terra1kj7pasy...",
  msg: { cancel: { id: number } },
  action: "launch-nft/cancel",
  memo: "www.boostdao.io"
}
```

---

## Next: Part 3

Continue to Part 3 for events 14-25 (Boost Tools, NFT Switch, Transfers)

---

**GitHub:** Save as `02-event-catalog-part-a.md`