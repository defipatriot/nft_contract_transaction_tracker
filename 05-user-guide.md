# Alliance DAO NFT Transaction Explorer
## User Guide & Interface Features

**Version:** 2.0  
**Date:** October 29, 2025  
**Part:** 5 of 5

---

## Quick Start Guide

### Getting Started (3 Easy Steps)

1. **Open the Explorer**
   - Download `tx-explorer-complete.html`
   - Double-click to open in your browser
   - Works immediately - no installation required

2. **Load Transaction Data**
   - Click "📅 Current" month button (selected by default)
   - Wait 2-5 seconds for data to load
   - See transactions appear in the table

3. **Explore Your Data**
   - Scroll through transactions
   - Click NFT thumbnails for details
   - Use filters to narrow results

**That's it!** You're ready to explore Alliance DAO transactions.

---

## Interface Overview

### Main Components

```
┌─────────────────────────────────────────────────┐
│         🏛️ Alliance DAO Logo & Title           │
├─────────────────────────────────────────────────┤
│  🔧 Tabs: Explorer | Price Tools | Docs         │
├─────────────────────────────────────────────────┤
│  📊 Stats Cards (Total TXs, NFTs, Volume)       │
├─────────────────────────────────────────────────┤
│  🎛️ Control Bar:                                │
│    - Month Selector                             │
│    - Event Filter                               │
│    - Currency Toggle (Token/LUNA/USD)           │
│    - Search Bar                                 │
│    - Column Toggles                             │
├─────────────────────────────────────────────────┤
│  📋 Transaction Table                           │
│    (NFT | Hash | Block | Time | Event | ...)    │
├─────────────────────────────────────────────────┤
│  ⬅️ ➡️ Pagination Controls                      │
└─────────────────────────────────────────────────┘
```

---

## Explorer Tab Features

### 1. Month Selector 📅

**Purpose:** Load transactions from specific months

**How to Use:**
- **Single-click** = Replace current selection
- **Double-click** = Add to selection (multi-month view)
- **"Current" button** = Latest transactions (updates daily)

**Examples:**
```
Single-click "Jan" → Shows only January
Double-click "Feb" → Shows January + February
Single-click "Mar" → Shows only March (replaces previous)
```

**Tips:**
- ✅ Can load multiple months at once
- ✅ Current month updates automatically
- ⚠️ Loading many months may be slow
- ⚠️ Selected months show cyan highlight

---

### 2. Event Type Filter 🏷️

**Purpose:** Show only specific transaction types

**Available Filters:**
- **Show All** - No filter (default)
- **BBL Sale** - Completed sales on BBL
- **BBL List** - New listings on BBL
- **BBL Delist** - Cancelled BBL listings
- **Boost Sale** - Completed sales on Boost
- **Boost List** - New listings on Boost
- **Boost Xfer** - Transfers via Boost
- **Boost Stake** - Staking via Boost
- **DAO Stake** - Lock NFTs for voting
- **DAO Unstake** - Unbond NFTs
- **OTC Trade** - NFT Switch transactions
- **Alliance** - Daily reward claims
- **Ally Failed** - Failed claims
- **Transfer** - Manual P2P transfers
- **NFT Break** - Destroyed NFTs

**How to Use:**
- **Single-click** = Show only this type
- **Double-click** = Add/remove from filter
- **"Show All"** = Clear all filters

**Example Workflow:**
```
Goal: See all marketplace activity
1. Double-click "BBL Sale"
2. Double-click "BBL List"
3. Double-click "Boost Sale"
4. Double-click "Boost List"
Result: Shows only marketplace transactions
```

---

### 3. Currency Display Toggle 💱

**Purpose:** View amounts in different currencies

**Three Modes:**
1. **💱 Token Mode** (default)
   - Shows original token (249 bLUNA)
   - Most accurate representation

2. **💱 LUNA Mode**
   - Converts to LUNA equivalent (262.47 LUNA)
   - Good for comparing values

3. **💱 USD Mode**
   - Shows dollar value ($1,240.53 USD)
   - Easy real-world comparison

**How to Use:**
- Click button to cycle through modes
- All amounts update immediately
- **Click any amount** to see all three values in popup

**Example Popup:**
```
┌──────────────────────────────────┐
│     💰 Price Details              │
├──────────────────────────────────┤
│  Original: 249 bLUNA              │
│  LUNA: 262.47 LUNA                │
│  USD: $1,240.53 USD               │
└──────────────────────────────────┘
```

---

### 4. Reward Claims Toggle 💰

**Purpose:** Show/hide daily Alliance reward claims

**States:**
- **Hidden** (default) - Cleaner view of NFT activity
- **Visible** - Include daily claims in results

**Why Hide Claims?**
- Daily claims create 365+ transactions per year
- Can clutter the view when looking for NFT sales/transfers
- Toggle on when analyzing DAO revenue

**Revenue Analysis Workflow:**
```
1. Click "💰 Rewards: Hidden" to show claims
2. Filter to only "Alliance" events
3. See all reward claims
4. Export to JSON for analysis
```

---

### 5. Search Bar 🔍

**Purpose:** Real-time text search across all fields

**Searchable Fields:**
- NFT IDs (#6748)
- Transaction hashes
- Block heights
- Addresses (full or partial)
- Token amounts
- Event types

**Search Tips:**
```
Search: "6748"        → Finds NFT #6748
Search: "BBL"         → All BBL marketplace transactions
Search: "249"         → All amounts containing 249
Search: "terra1abc"   → Specific wallet address
Search: "stake"       → All staking-related events
```

**Features:**
- ✅ Case-insensitive
- ✅ Partial matching
- ✅ Updates as you type
- ✅ Works with filters
- ✅ Highlights matching text

---

### 6. Column Visibility Toggles 👁️

**Purpose:** Customize table display

**Toggleable Columns:**
- **TX Hash** - Transaction identifier
- **NFT Count** - Number of NFTs
- **Fees** - Gas fees and marketplace fees
- **Actions** - View raw data button

**Default View:**
```
Visible: NFT, Block, Time, Event, Price, Sender, Recipient
Hidden: TX Hash, NFT Count, Fees, Actions
```

**Mobile Optimization:**
```
Auto-hidden on small screens:
- TX Hash
- NFT Count
- Fees
- Actions
```

**Pro Tip:** Hide columns you don't need to see more data without scrolling

---

### 7. Force Reload Checkbox ♻️

**Purpose:** Bypass browser cache for fresh data

**When to Use:**
- After knowing data was updated
- Seeing stale/old information
- Troubleshooting missing transactions

**How It Works:**
```javascript
// Normal load (uses cache):
fetch("2025-01.json")

// Force reload (skips cache):
fetch("2025-01.json?t=" + Date.now())
```

**Note:** Slows down loading slightly but ensures latest data

---

## Transaction Table Features

### NFT Column

**Display Options:**

1. **Single NFT**
   ```
   ┌─────────┐
   │  🖼️     │
   │ #6748   │
   └─────────┘
   ```
   - Shows thumbnail
   - Displays NFT ID
   - Click to see full metadata

2. **Multiple NFTs**
   ```
   ┌─────────┐
   │  🖼️ +3  │  ← Overlay shows count
   │ #6748   │  ← Primary NFT shown
   └─────────┘
   ```
   - Shows first NFT + count
   - Click to see all NFTs in modal

3. **Broken NFT**
   ```
   ┌─────────┐
   │⚠️BROKEN │  ← Red banner
   │  🖼️     │
   │ #6748   │
   └─────────┘
   ```
   - Red warning banner
   - Still clickable

4. **Alliance Claims**
   ```
   ┌─────────┐
   │   💰    │  ← Dollar sign icon
   │  CLAIM  │
   └─────────┘
   ```
   - Click to see claim details

---

### Interactive Elements

#### 1. NFT Thumbnails (Click)
```
Shows modal with:
- Full-size image
- NFT ID and name
- Rarity information
- Current owner
- Staking status
- Reward accumulation
- Transaction history link
```

#### 2. Event Badges (Click)
```
Shows detection details:
- Event emoji and title
- Detection method
- Key indicators
- Explanatory notes
- Example transactions
```

#### 3. Timestamps (Click)
```
Shows timezone conversions:
- UTC time
- Local browser time
- Block time
- Time ago
- Unix timestamp
```

#### 4. Amounts (Click)
```
Shows all currency values:
- Original token amount
- LUNA equivalent
- USD value
- Rate used for conversion
```

#### 5. Addresses (Click)
```
Copies to clipboard:
- Full Terra address
- Shows toast confirmation
- One-click paste ready
```

---

## Price Tools Tab

### Overview
Real-time token prices from CoinGecko API

### Components

#### 1. Combined Price List
```
Token          Price      24h Change
────────────────────────────────────
🌙 LUNA        $5.25      +2.5% 📈
📊 ampLUNA     $5.51      +1.8% 📈
🔷 arbLUNA     $5.20      +2.1% 📈
🔵 bLUNA       $5.15      +2.3% 📈
💎 SOLID       $0.45      -0.5% 📉
💵 USDC        $1.00      +0.0% →
💶 EUR         $1.08      +0.1% →
🎯 CAPA        $0.08      +5.2% 📈
🦁 ROAR        $0.12      -1.2% 📉
⭐ ASTRO       $0.15      +3.1% 📈
```

**Features:**
- ✅ Live prices (updates on page load)
- ✅ 24-hour change percentage
- ✅ Up/down indicators
- ✅ Organized by category

#### 2. Comparison Charts
Three tabs with lazy-loaded charts:

**LUNA & LSTs Tab:**
```
Chart comparing:
- LUNA (reference)
- ampLUNA
- arbLUNA
- bLUNA
```

**Stablecoins Tab:**
```
Chart comparing:
- SOLID
- USDC
- EUR
```

**Project Tokens Tab:**
```
Chart comparing:
- CAPA
- ROAR
- ASTRO
```

**Lazy Loading:**
- Only LUNA chart loads initially
- Others load when you click their tab
- Reduces API calls = no rate limiting

#### 3. Price Converter
```
┌────────────────────────────┐
│  Amount: [____]            │
│  From: [LUNA ▼]            │
│  To: [USDC ▼]              │
│                            │
│  Result: $52.50            │
└────────────────────────────┘
```

**Supported Conversions:**
- Any token to any token
- Uses live CoinGecko rates
- Updates in real-time

---

## Docs Tab

### Documentation Links

```
📚 Technical Documentation
  → README
  → Part 1: System Overview
  → Part 2: Event Detection
  → Part 3: Data Extraction
  → Part 4: Address Directory
  → Part 5: User Guide (this doc)

🔗 External Resources
  → GitHub Repository
  → Alliance DAO Website
  → Terra Blockchain Explorer
  → CoinGecko API
```

**All links open in new tab** - Explorer stays open

---

## Advanced Features

### 1. Export Functionality

#### Export to JSON
```javascript
{
  "exportDate": "2025-10-29T14:30:00Z",
  "filters": {
    "months": ["current", 10],
    "events": ["BBL_SALE", "BOOST_SALE"],
    "search": "stake"
  },
  "transactions": [
    // Filtered transaction objects
  ],
  "statistics": {
    "totalTransactions": 85,
    "totalVolume": "12450000000",
    "uniqueNFTs": 42
  }
}
```

**Use Cases:**
- Data analysis in Excel/Python
- Backup transaction history
- Share filtered datasets
- Create custom reports

#### Export to CSV
```csv
Hash,Block,Timestamp,Event,NFTs,Amount,Token,Sender,Recipient
8E6FC36...,12345678,2025-01-15T14:30:00Z,BBL_SALE,1,249000000,bLUNA,terra1abc...,terra1def...
```

**Use Cases:**
- Spreadsheet analysis
- Tax reporting
- Accounting records

---

### 2. Multi-NFT Modal

**Shows when clicking +N overlay:**
```
┌──────────────────────────────────────┐
│  🖼️ Multiple NFTs (3 total)          │
├──────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐             │
│  │#6748│ │#1033│ │#2941│             │
│  └─────┘ └─────┘ └─────┘             │
│                                      │
│  Transaction: 8E6FC36BC4...          │
│  Event: NFT Switch Batch Transfer    │
│  Sender: terra1abc...                │
│  Recipient: terra1def...             │
│                                      │
│  [View TX on Chainsco.pe]            │
└──────────────────────────────────────┘
```

**Features:**
- All NFT thumbnails visible
- Click any NFT for individual details
- Shows transaction context
- Link to blockchain explorer

---

### 3. Raw Data Viewer

**Purpose:** See unprocessed transaction data

**Access:** Click "View Raw" button in Actions column

**Shows:**
```json
{
  "tx": {
    "body": {
      "messages": [...],
      "memo": "...",
      "timeout_height": "0",
      "extension_options": [],
      "non_critical_extension_options": []
    },
    "auth_info": {
      "signer_infos": [...],
      "fee": {
        "amount": [...],
        "gas_limit": "500000",
        "payer": "",
        "granter": ""
      }
    },
    "signatures": [...]
  },
  "tx_response": {
    "height": "12345678",
    "txhash": "8E6FC36BC4...",
    "code": 0,
    "events": [...],
    "logs": [...]
  }
}
```

**Use Cases:**
- Debugging event detection
- Verifying data accuracy
- Understanding blockchain structure
- Developer reference

---

### 4. Statistics Cards

**Live-Updated Metrics:**

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ 📊 Total TXs   │  │ 🖼️ NFTs        │  │ 💰 Volume      │
│                │  │                │  │                │
│    1,247       │  │    342         │  │  $127,450      │
│                │  │                │  │                │
│ ↑ 24h: +15     │  │ ↑ 24h: +8      │  │ ↑ 24h: +$4.2K  │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ 🏪 Marketplace │  │ 🔒 Staked      │  │ 💔 Broken      │
│                │  │                │  │                │
│    847         │  │    2,431       │  │    127         │
│                │  │                │  │                │
│ 68% of total   │  │ 24.3% of NFTs  │  │ 1.27% of NFTs  │
└────────────────┘  └────────────────┘  └────────────────┘
```

**Updates:**
- Real-time as filters change
- Reflects current view only
- Helps understand data at a glance

---

## Keyboard Shortcuts

### Navigation
- **↑** / **↓** - Scroll table
- **Ctrl + F** - Focus search bar
- **Esc** - Close modals
- **←** / **→** - Change pages

### Quick Actions
- **Ctrl + E** - Toggle event filter
- **Ctrl + M** - Toggle month selector
- **Ctrl + C** - Toggle currency mode
- **Ctrl + R** - Toggle reward claims

**Note:** Shortcuts work when not typing in search bar

---

## Best Practices

### Performance Tips

1. **Load Smart:**
   ```
   ❌ Don't load all 12 months at once
   ✅ Load specific months you need
   ✅ Use "Current" for latest data
   ```

2. **Filter Early:**
   ```
   ❌ Load all data then search
   ✅ Apply event filters first
   ✅ Then use search for specific items
   ```

3. **Hide Unused Columns:**
   ```
   ❌ Show all columns on small screen
   ✅ Hide columns you don't need
   ✅ Improves scrolling performance
   ```

### Data Analysis Workflow

```
Goal: Analyze BBL marketplace activity in January

1. Load Data:
   - Single-click "Jan" month

2. Filter Events:
   - Double-click "BBL Sale"
   - Double-click "BBL List"
   - Double-click "BBL Delist"

3. Review:
   - Scroll through filtered results
   - Click amounts to see USD values
   - Note patterns in timing

4. Export:
   - Click "Export JSON"
   - Open in spreadsheet
   - Create pivot tables/charts

5. Share:
   - Take screenshots
   - Export specific transactions
   - Link to GitHub for full data
```

### Monthly Review Routine

```
Every beginning of month:

1. Check Previous Month:
   - Click previous month (e.g., "Oct")
   - Review total volume
   - Note top transactions
   - Export for records

2. Update Address Book:
   - Note any new wallets
   - Check if members need updating
   - Submit PRs to GitHub

3. Verify Data Quality:
   - Check if any "Unknown" events
   - Verify token detection
   - Report issues on GitHub

4. Share Insights:
   - Post stats to Discord
   - Create visualizations
   - Discuss trends with community
```

---

## Troubleshooting

### Common Issues

#### 1. "Failed to load transactions"

**Symptoms:** Error message, empty table

**Solutions:**
```
1. Check internet connection
2. Try "Force Reload" checkbox
3. Try different month
4. Clear browser cache
5. Check GitHub repository is accessible
```

**Still Not Working?**
```
- Check browser console for errors (F12)
- Verify GitHub raw URLs work
- Try different browser
- Report issue on GitHub
```

#### 2. "CoinGecko 429 errors"

**Symptoms:** Price widgets show errors

**Solutions:**
```
1. Wait 60 seconds
2. Don't refresh page repeatedly
3. Prices will retry automatically
4. Consider using without prices
```

**Prevention:**
```
✅ Don't spam refresh
✅ Close duplicate tabs
✅ Wait between page loads
```

#### 3. "NFT images not loading"

**Symptoms:** Broken image icons, placeholders

**Solutions:**
```
1. Wait - images lazy-load
2. Scroll down to trigger loading
3. Check GitHub image repo
4. Some NFTs may use placeholders
```

#### 4. "Table is slow/laggy"

**Symptoms:** Scrolling stutters, filters slow

**Solutions:**
```
1. Reduce loaded months
2. Apply event filters
3. Hide unused columns
4. Close other browser tabs
5. Use more powerful device
```

**Optimization:**
```
Instead of: Loading 12 months + no filters
Try: Load 1-2 months + specific event filters
Result: 10x faster performance
```

#### 5. "Wrong token showing"

**Example:** Says "249 LUNA" should be "249 bLUNA"

**Report:**
```
1. Note transaction hash
2. Check event type
3. Report on GitHub with:
   - TX hash
   - Expected vs actual token
   - Screenshot
```

---

## FAQ

### General Questions

**Q: Does this work offline?**
A: Partially. After loading once, cached data works offline. But needs internet for:
- Initial data load
- CoinGecko prices
- NFT images
- New month data

**Q: Is my data private?**
A: Yes! All processing happens in your browser. Nothing is sent to servers. All data is public blockchain info anyway.

**Q: Can I use this on mobile?**
A: Yes, but desktop recommended. Table scrolling can be awkward on small screens. Portrait mode works better than landscape.

**Q: How often is data updated?**
A: Historical months: Never (finalized)  
Current month: Daily at ~9 AM UTC  
Prices: On page load  
Address book: Hourly (cached)

### Technical Questions

**Q: What blockchain is this?**
A: Terra (formerly Terra 2.0, now just "Terra")

**Q: Can I fork/modify this?**
A: Yes! It's open source. See GitHub repository.

**Q: Can this track other NFT collections?**
A: Not currently. Built specifically for Alliance DAO. But code is adaptable.

**Q: Why single HTML file?**
A: Portability! Easy to download, share, and run anywhere. No build process needed.

**Q: Can I add my own address to the book?**
A: Yes! Submit PR to transaction-tracker_docs repository with your info.

---

## Support & Contributing

### Get Help

**Discord:** Alliance DAO community server  
**GitHub Issues:** Report bugs and request features  
**Documentation:** This file + other parts  
**Email:** Community moderators

### Contribute

**Ways to Help:**
1. **Report Bugs** - Found something wrong? Let us know
2. **Suggest Features** - Ideas welcome on GitHub
3. **Update Address Book** - Add known wallets/contracts
4. **Improve Docs** - Fix typos, add examples
5. **Spread the Word** - Share with other DAOs

**Code Contributions:**
```bash
# Fork repository
git clone https://github.com/defipatriot/nft_contract_transaction_tracker

# Make improvements
# Test thoroughly

# Submit pull request
# Include:
# - What changed
# - Why it's better
# - Screenshots if UI change
```

---

## Version History

### V4-COMPLETE (Current)
- ✅ Currency display toggle (Token/LUNA/USD)
- ✅ Clickable amounts showing all conversions
- ✅ Clickable event badges with detection logic
- ✅ Improved token prefix detection (bLUNA fix)
- ✅ Combined price list (CoinGecko optimization)
- ✅ Lazy-loaded charts (rate limit fix)
- ✅ Multi-month selector
- ✅ Event type filters
- ✅ Reward claims toggle
- ✅ Force reload option

### V3 (Previous)
- Transaction classification for 25 event types
- NFT thumbnail display
- Multi-NFT support
- Address resolution
- Search and filter

### V2 (Legacy)
- Basic transaction display
- Manual month loading
- Limited event detection

### V1 (Initial)
- Proof of concept
- Single month only
- No filtering

---

## Appendix: Data Sources

### GitHub Repositories
```
Transaction Data:
https://github.com/defipatriot/adao_nft-tx_2025

NFT Metadata:
https://github.com/defipatriot/nft-metadata

Address Book:
https://github.com/defipatriot/transaction-tracker_docs

Source Code:
https://github.com/defipatriot/nft_contract_transaction_tracker
```

### External APIs
```
CoinGecko Price API:
https://api.coingecko.com/api/v3/simple/price

NFT Status API:
https://deving.zone/en/nfts/alliance_daos.json

Terra LCD:
https://terra-classic-lcd.publicnode.com
```

### Block Explorers
```
Chainsco.pe:
https://chainsco.pe/terra2

Terra Finder:
https://finder.terra.money
```

---

## Glossary

**Terms Used in Explorer:**

- **TX Hash:** Unique transaction identifier (64 chars hex)
- **Block Height:** Blockchain block number where TX was included
- **Event Type:** Classification of transaction (25 types)
- **Token ID:** NFT identifier (#6748 = NFT number 6748)
- **Micro-units:** Blockchain amount format (1 LUNA = 1,000,000 uluna)
- **Gas Fee:** Transaction cost paid to validators
- **Protocol Fee:** Marketplace commission (2%)
- **Royalty:** Creator/DAO revenue share (5%)
- **OTC:** Over-the-counter (private sale)
- **LST:** Liquid Staking Token (ampLUNA, bLUNA, arbLUNA)
- **DAODao:** Governance platform for NFT DAOs
- **Staking:** Locking NFTs for voting power
- **Unbonding:** 7-day period after unstaking
- **Escrow:** Holding assets during trade
- **Memo:** Optional transaction note field

---

## Conclusion

You now have complete knowledge of the Alliance DAO NFT Transaction Explorer!

**Key Takeaways:**
- 🏛️ Tracks all 10,000 aDAO NFT transactions
- 📊 25+ event types automatically classified
- 💱 Three currency modes (Token/LUNA/USD)
- 🔍 Powerful filtering and search
- 📈 Real-time price integration
- 🎯 Human-readable addresses
- 📦 Single HTML file - works anywhere
- 🔓 Fully open source and transparent

**Happy Exploring!** 🚀

---

**This concludes the Alliance DAO NFT Transaction Explorer documentation series.**

**All 5 parts:**
1. System Overview & Architecture
2. Event Detection & Classification
3. Data Extraction & Token Handling
4. Address Directory & Human-Readable Names
5. User Guide & Interface Features (this document)

**GitHub:** Save as `05-user-guide.md`
