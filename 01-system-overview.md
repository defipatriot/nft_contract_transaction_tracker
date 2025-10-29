# Alliance DAO NFT Transaction Explorer
## System Overview & Architecture

**Version:** 2.0  
**Date:** October 29, 2025  
**Last Updated:** Current implementation as of V4-COMPLETE

---

## Executive Summary

The Alliance DAO NFT Transaction Explorer is a comprehensive web-based tool that monitors, tracks, and displays all on-chain transactions for the Alliance DAO NFT collection on the Terra blockchain. The system processes pre-generated JSON transaction data files and presents them through an interactive, glassmorphism-styled interface with extensive filtering, searching, and analysis capabilities.

---

## System Architecture

### Data Pipeline

```
Terra Blockchain
      ↓
Python Script (Backend)
  - Scans blockchain for NFT transactions
  - Classifies events into 25+ types
  - Extracts metadata (NFTs, prices, fees)
  - Generates monthly JSON files
      ↓
GitHub Repository
  - Hosts JSON data files
  - Organized by month (YYYY-MM.json)
  - Metadata files (NFT images, addresses)
      ↓
Explorer Interface (HTML/JS)
  - Fetches JSON via raw.githubusercontent.com
  - Client-side filtering & display
  - Real-time price integration (CoinGecko)
  - Interactive visualizations
```

### Core Components

1. **Data Generation (Python Backend)**
   - Location: Separate repository/service
   - Frequency: Daily snapshots
   - Output: Monthly JSON files + current month
   - Format: Standardized transaction objects

2. **Data Hosting (GitHub)**
   - Repository: `defipatriot/adao_nft-tx_2025`
   - File Structure:
     ```
     /2024-10.json  (October 2024)
     /2024-11.json  (November 2024)
     /2024-12.json  (December 2024)
     /2025-01.json  (January 2025)
     /current.json  (Live month)
     ```

3. **Explorer Interface (Single HTML File)**
   - Technology: Vanilla JavaScript + Tailwind CSS
   - Deployment: Static hosting (can run locally)
   - Features: Complete client-side processing

4. **External Data Sources**
   - CoinGecko API: Real-time token prices
   - NFT Metadata: `nft-metadata` repository
   - NFT Status: `deving.zone` API (broken NFTs)
   - Address Book: `transaction-tracker_docs` repository

---

## Key Contracts & Addresses

### Core Protocol
| Address | Purpose | Type |
|---------|---------|------|
| `terra1phr9fngjv7...w3apw9` | Alliance DAO NFT Contract | CW721 NFT |
| `terra1ecgazyd0w...q68mq2s5lvsct` | ampLUNA Token | CW20 Reward Token |

### Governance
| Address | Purpose |
|---------|---------|
| `terra1c57ur376...am6qmvqx47` | DAODao Staking Contract |
| `terra14gv57x9l...35stx69j2` | DAODao Voting Contract |

### Marketplaces
| Address | Platform | Payment Tokens |
|---------|----------|----------------|
| `terra1ej4cv98e...595s7gccs9` | BBL (Necropolis) | bLUNA only |
| `terra1kj7pasy...dfftx0vqspf4at` | Boost (LaunchNFT) | Any token |
| `terra1wm7rag4f...dlkdks0n8yk0` | NFT Switch | Private OTC |

---

## Transaction Event Types

The system currently tracks **25 distinct event types** across 7 categories:

### 1. Core Protocol Events (3)
- `ALLIANCE_CLAIM` - Daily reward claims
- `CLAIM_FAILED` - Failed claim attempts  
- `BREAK` - NFT destruction for rewards

### 2. DAODao Governance (3)
- `DAODAO_STAKE` - Lock NFTs for voting
- `DAODAO_UNSTAKE` - Begin 7-day unbonding
- `DAODAO_CLAIM_NFTS` - Claim after unbonding

### 3. BBL Marketplace (4)
- `BBL_LISTING` - List for sale (bLUNA)
- `BBL_SALE` - Completed purchase
- `BBL_DELIST` - Cancel listing
- `BBL_COLLECTION_OFFER` - Collection-wide bid

### 4. Boost Marketplace (4)
- `BOOST_LISTING` - List for sale (any token)
- `BOOST_SALE` - Completed purchase
- `BOOST_CANCEL` - Cancel listing
- `BOOST_BID` - Place bid on listing

### 5. Boost Tools (3)
- `BOOST_TRANSFER` - P2P via Boost UI
- `BOOST_STAKE` - Stake via Boost
- `ENTERPRISE_UNSTAKE_BOOST` - Legacy recovery

### 6. NFT Switch (4)
- `NFTSWITCH_BATCH_TRANSFER` - Multi-NFT transfers
- `NFTSWITCH_OTC_CREATE` - Create private sale
- `NFTSWITCH_OTC_CONFIRM` - Operator confirms
- `NFTSWITCH_OTC_COMPLETE` - Sale executes

### 7. Direct Transfers (1)
- `TRANSFER` - Manual wallet-to-wallet

---

## Data Structure

### Standard Transaction Object
```javascript
{
  // Identity
  hash: "8E6FC36BC49...",           // TX hash
  height: 12345678,                 // Block height
  timestamp: "2025-01-15T14:30:00Z", // ISO 8601
  
  // Classification
  eventType: "BBL_SALE",            // One of 25 types
  platform: "BBL",                  // BBL, Boost, NFTSwitch, Manual
  
  // NFTs Involved
  tokenIds: ["6748", "1033"],       // Always array (even single)
  nftCount: 2,                      // Number of NFTs
  
  // Parties
  sender: "terra1abc...",
  recipient: "terra1def...",
  
  // Financial Data
  amount: "249000000",              // Micro-units (249 bLUNA)
  token: "bLUNA",
  fees: "2% Protocol + 5% Royalty",
  
  // Gas
  gasWanted: 500000,
  gasUsed: 387492,
  gasFee: "0.125 LUNA"
}
```

### Multi-NFT Support
**Critical:** ALL transaction types support multiple NFTs
- Single NFT: `tokenIds: ["6748"]`
- Multiple NFTs: `tokenIds: ["6748", "1033", "2941"]`
- No NFTs (claims): `tokenIds: []`

---

## Explorer Interface Features

### 1. Data Loading
- **Month Selector**: Load specific months or "Current"
  - Single-click: Replace selection
  - Double-click: Add to selection
  - Can load multiple months simultaneously
  
- **Force Reload**: Bypass browser cache for fresh data

### 2. Filtering System
- **Event Type Filter**: Show specific transaction types
  - 15 preset filters (BBL Sale, Boost List, etc.)
  - Multi-select capability (double-click)
  
- **Reward Claims Toggle**: Show/hide daily claims
  - Default: Hidden (reduces noise)
  
- **Search Bar**: Real-time text search
  - NFT IDs, addresses, TX hashes, amounts
  
- **Column Visibility**: Toggle table columns on/off

### 3. Currency Display
**NEW Feature:** Three display modes via toggle button
- **Token Mode** (default): Show original token amounts
  - Example: 249 bLUNA, 836.62 ampLUNA
  
- **LUNA Mode**: Convert all to LUNA equivalent
  - Example: 249 bLUNA → 262.47 LUNA
  
- **USD Mode**: Convert all to USD value
  - Example: 249 bLUNA → $1,240.53 USD
  
- **Click amounts** to see popup with all three conversions

### 4. Price Integration
- **CoinGecko API**: Live token prices
- **Supported Tokens**:
  - LUNA, ampLUNA, arbLUNA, bLUNA
  - SOLID, USDC, EUR (stablecoins)
  - CAPA, ROAR, ASTRO (project tokens)

### 5. Interactive Elements
- **NFT Thumbnails**: Click to view full metadata
- **Multi-NFT Indicator**: +N overlay on batch transactions
- **Event Badges**: Click to see detection logic
- **Timestamp Display**: Click to see timezone conversions
- **Address Resolution**: Human-readable names for known wallets

### 6. Data Visualization
- **Price Charts**: Comparison charts by category
  - LUNA & Liquid Staking Tokens
  - Stablecoins
  - Project Tokens
  - Lazy-loaded (only when tab clicked)
  
- **Statistics Cards**: 
  - Total transactions
  - NFT count
  - Volume metrics
  - Fee summaries

### 7. Export Capabilities
- **Export to JSON**: Download filtered results
- **CSV Export**: Spreadsheet-compatible format
- **Copy Functions**: One-click copy for hashes, addresses

---

## Rate Limiting & Optimization

### CoinGecko API Strategy
**Problem:** Multiple widgets = 8+ simultaneous API calls = Rate limit (429 errors)

**Solution Implemented:**
1. **Combined Price List**: 1 API call for all tokens (was 4)
2. **Lazy Chart Loading**: Charts load only when tab clicked (was 3 immediate)
3. **Converter Delay**: 3-second delay with retry logic
4. **Result**: 3 initial calls, additional calls on-demand

### Data Caching
- Browser caches JSON files
- Force Reload option for fresh data
- NFT metadata cached in localStorage

---

## Browser Requirements

### Minimum Requirements
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- 4GB RAM recommended
- Internet connection for:
  - JSON data files
  - CoinGecko prices
  - NFT images
  - External links

### Recommended Setup
- Desktop/laptop (mobile works but limited)
- 1920x1080 resolution or higher
- Fast internet (for image loading)
- Ad blocker (optional, improves CoinGecko reliability)

---

## Data Update Frequency

### Transaction Data
- **Historical Months**: Static (finalized)
- **Current Month**: Updated daily
- **Update Time**: ~8:50 AM UTC (after Alliance claim)

### Real-Time Data
- **Token Prices**: Fetched on page load
- **NFT Status**: Fetched on page load
- **Address Book**: Fetched on page load

---

## Security & Privacy

### Data Handling
- âœ… No user data collected
- âœ… No analytics/tracking
- âœ… All processing client-side
- âœ… No server-side storage
- âœ… Public blockchain data only

### External Connections
- GitHub (transaction data)
- CoinGecko (prices)
- Terra blockchain explorers (links)
- deving.zone (NFT status)

---

## Deployment Options

### 1. Local File (Recommended)
```bash
# Download HTML file
# Double-click to open in browser
# Works 100% offline after initial data load
```

### 2. Static Hosting
```bash
# Upload to any static host:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
```

### 3. IPFS
```bash
# Decentralized hosting
ipfs add tx-explorer.html
```

---

## Known Limitations

### Current Constraints
1. **Client-Side Processing**: Large datasets (1000+ TXs) may be slow
2. **CoinGecko Rate Limits**: Refresh page sparingly
3. **Browser Memory**: Very large month loads may lag
4. **Mobile UX**: Table scrolling on small screens
5. **Historical Data**: Only back to Oct 2024 (when tracking began)

### Future Enhancements
- Server-side processing for large datasets
- WebSocket for real-time updates
- Advanced analytics dashboard
- Export to PDF reports
- Multi-collection support

---

## Troubleshooting

### Common Issues

**1. "Failed to load transactions"**
- Check internet connection
- Try Force Reload checkbox
- Clear browser cache
- Check GitHub repository is accessible

**2. "CoinGecko 429 errors"**
- Wait 60 seconds
- Prices will retry automatically
- Consider refreshing less frequently

**3. "NFT images not loading"**
- Check GitHub image repository
- Images lazy-load (scroll to see)
- Some NFTs may use placeholder

**4. "Table is slow/laggy"**
- Reduce loaded months
- Use event filters
- Hide unnecessary columns
- Close other browser tabs

---

## Architecture Decisions

### Why Static HTML?
- âœ… No backend server required
- âœ… Easy deployment (double-click to run)
- âœ… No installation dependencies
- âœ… Works offline after initial load
- âœ… Version control friendly (single file)

### Why Pre-Generated JSON?
- âœ… Consistent data structure
- âœ… Fast page load times
- âœ… No blockchain RPC dependency
- âœ… Historical snapshots preserved
- âœ… Reduces API rate limits

### Why Client-Side Processing?
- âœ… Maximum transparency (view source)
- âœ… No server costs
- âœ… Privacy-preserving
- âœ… Instant filtering/searching
- âœ… Easy to audit code

---

## Related Documentation

- **Part 2**: Event Detection & Classification Logic
- **Part 3**: Data Extraction & Token Handling  
- **Part 4**: Address Directory & Pattern Matching
- **Part 5**: Database Schemas & Analytics Queries

---

**GitHub Repository:** `defipatriot/nft_contract_transaction_tracker`  
**Data Repository:** `defipatriot/adao_nft-tx_2025`  
**Maintained by:** Alliance DAO Community
