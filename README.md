# AllianceDAO NFT Transaction Tracker Documentation

Complete technical documentation for identifying and tracking all 25 transaction types for the AllianceDAO NFT collection on Terra blockchain.

## 📚 Documentation

### Core Documentation
1. **[Overview & Design Principles](overview-and-principles.md)**
   - Project context and key contracts
   - Critical design principles for scalability
   - Multi-NFT handling patterns
   - Event type categories

2. **[Event Catalog Part 1 (Events 1-13)](event-catalog_part_1-13.md)**
   - ALLY Rewards Claim
   - NFT Break
   - DAODao Staking/Unstaking
   - BBL Marketplace Events
   - Boost Marketplace Events

3. **[Event Catalog Part 2 (Events 14-25)](event-catalog_part_14-25.md)**
   - Boost Tools (Transfer, Stake)
   - Enterprise Unstake
   - NFT Switch Batch Transfers
   - NFT Switch OTC (3-step process)
   - P2P Transfers

4. **[Address Directory & Pattern Matching](address-directory_pattern-matching.md)**
   - Complete contract address directory
   - Master transaction classifier code
   - Fee extraction logic
   - Validation patterns

5. **[Database Schemas & Analytics](database-schemas_analytics.md)**
   - PostgreSQL database schemas
   - Analytics views and queries
   - Key performance indicators
   - Reference transaction hashes

## 🎯 Quick Stats

- **Total Event Types:** 25
- **Platforms Covered:** BBL, Boost, NFT Switch, DAODao
- **Research Period:** October 2-16, 2025
- **Version:** 1.0

## 🔍 What This Covers

### Protocol Events
- Daily ALLY rewards claims
- NFT breaks (reward redemption)
- Enterprise DAO legacy cleanup

### Governance
- DAODao staking (2-step process)
- DAODao unstaking (7-day unbonding)
- DAODao claim NFTs

### Marketplaces
- **BBL:** Listings, sales, cancellations, collection offers
- **Boost:** Listings, sales, cancellations (multi-token support)
- **NFT Switch:** Batch transfers, OTC trades (3-step process)

### Tools & Transfers
- Boost convenience tools
- Manual transfers
- Batch operations

## 💰 Fee Structures

| Platform | Protocol Fee | DAO Royalty | Total Fees |
|----------|--------------|-------------|------------|
| BBL | 2% | 5% | 7% |
| Boost | 2% | 5% | 7% |
| NFT Switch OTC | 4% (2% each side) | 0% | 4% |

## 🚀 Usage

This documentation enables you to:
- ✅ Build blockchain indexers
- ✅ Create analytics dashboards
- ✅ Track DAO revenue (5% royalties)
- ✅ Monitor NFT supply and holders
- ✅ Analyze marketplace activity
- ✅ Track staking metrics

## 📊 Key Design Principles

1. **Always Handle Arrays** - All NFT fields use arrays for scalability
2. **Extract from Events** - Some data only exists in events, not messages
3. **Platform Hierarchy** - Contract → Message → Action → Memo
4. **Fee Tracking** - Parse multiple transfer events for sales
5. **Deduplication** - Same NFT can appear multiple times in events

## 🔗 Integration Examples

### Website Embed
```html
<iframe src="https://github.com/defipatriot/nft_contract_transaction_tracker/blob/main/overview-and-principles.md" 
        width="100%" height="600"></iframe>
```

### Direct Links
Link to specific sections from your website:
- [How to identify transactions](address-directory_pattern-matching.md#master-transaction-classifier)
- [Database setup](database-schemas_analytics.md#master-tables)
- [Fee structures](event-catalog_part_14-25.md#fee-structures-comparison)

## 📖 Methodology

All patterns were derived from **real on-chain transactions** and validated across multiple examples. Each event type includes:
- Reference transaction hash
- Primary identifiers
- Data extraction patterns
- Scalability notes
- Code examples

## 🤝 Contributing

Found a new transaction pattern? Please:
1. Document the transaction hash
2. Identify the pattern
3. Submit a pull request with updates

## 📜 License

[Your License Here]

## 🔗 Links

- **Website:** [Your Website]
- **Discord:** [Your Discord]
- **Twitter:** [Your Twitter]

---

**Built with ❤️ for the AllianceDAO community**
```

---

### 2. Add LICENSE File

Create `LICENSE` (if needed):
```
MIT License

Copyright (c) 2025 [Your Name/Organization]

Permission is hereby granted, free of charge, to any person obtaining a copy...