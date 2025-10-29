# Alliance DAO NFT Transaction Explorer
## Complete Technical Documentation

**Version:** 2.0  
**Last Updated:** October 29, 2025  
**Status:** Current Implementation (V4-COMPLETE)

---

## 📚 Documentation Overview

This is the **complete technical documentation** for the Alliance DAO NFT Transaction Explorer, a comprehensive web-based tool that monitors and displays all on-chain transactions for the Alliance DAO NFT collection on the Terra blockchain.

### What's New in V2.0 Documentation

✅ **Updated for Current Implementation** - Reflects actual working code in tx-explorer-complete.html  
✅ **Currency Display System** - New 3-mode toggle (Token/LUNA/USD)  
✅ **CoinGecko Optimization** - Fixed rate limiting issues  
✅ **Token Detection** - Corrected bLUNA prefix handling  
✅ **Interactive Features** - Clickable amounts and event badges  
✅ **User-Friendly** - Complete interface guide and best practices

---

## 📖 Documentation Parts

### [Part 1: System Overview & Architecture](./01-system-overview.md)
**What's Inside:**
- Complete system architecture diagram
- Data pipeline explanation (Python → GitHub → Browser)
- 25 transaction event types catalog
- Core contracts and addresses
- Deployment options and requirements
- Known limitations and future enhancements

**Read this first if you want to understand:**
- How the entire system works
- What data the explorer displays
- Where the data comes from
- Why it's designed as a static HTML file

---

### [Part 2: Event Detection & Classification](./02-event-detection.md)
**What's Inside:**
- Detection logic for all 25 event types
- Priority hierarchy (contract → message → action → memo)
- BBL, Boost, and NFT Switch platform patterns
- Alliance rewards and governance events
- Multi-NFT transaction handling
- Reference transaction hashes for testing

**Read this if you want to understand:**
- How transactions are classified
- What makes each event type unique
- Detection patterns and identifiers
- Why certain events are detected differently

**Key Sections:**
- Core Protocol Events (Claims, Breaks)
- DAODao Governance (Stake, Unstake, Claim)
- Marketplace Events (BBL, Boost listings/sales)
- Tool Events (Boost Transfer, Enterprise Recovery)
- NFT Switch OTC (3-step process)
- Manual Transfers

---

### [Part 3: Data Extraction & Token Handling](./03-data-extraction.md)
**What's Inside:**
- Micro-unit to human-readable conversion
- Token amount extraction from multiple sources
- Fee calculation logic (BBL, Boost, NFT Switch)
- Alliance rewards extraction
- Currency conversion system (Token/LUNA/USD)
- Gas fee handling and efficiency metrics

**Read this if you want to understand:**
- How amounts are extracted from blockchain data
- Token detection and logo assignment
- Fee structure differences between platforms
- The new currency display modes
- CoinGecko price integration
- Why some amounts show wrong tokens (and the fix)

**Critical Fixes Documented:**
- ✅ Token prefix detection (bLUNA was showing as LUNA)
- ✅ Gas fee extraction from micro-units
- ✅ Multi-NFT amount handling

---

### [Part 4: Address Directory & Human-Readable Names](./04-address-directory.md)
**What's Inside:**
- Complete address directory structure
- All core contracts with descriptions
- Known DAO members and wallets
- Address resolution priority system
- Icon mapping for different categories
- Copy-to-clipboard functionality
- Address validation and checksums

**Read this if you want to understand:**
- How "terra1abc..." becomes "BBL Marketplace"
- The address book loading system
- Adding new addresses to the directory
- Address analytics and statistics
- Member detection logic

**Address Categories:**
- Core Protocol (NFT contract, ampLUNA)
- Governance (DAODao staking/voting)
- Marketplaces (BBL, Boost, NFT Switch)
- Treasury & Fee Wallets
- DAO Members & Whales

---

### [Part 5: User Guide & Interface Features](./05-user-guide.md)
**What's Inside:**
- Quick start guide (3 easy steps)
- Complete interface walkthrough
- All features explained with examples
- Keyboard shortcuts
- Best practices for data analysis
- Troubleshooting common issues
- FAQ and support information

**Read this if you want to:**
- Learn how to use the explorer effectively
- Understand all the features and controls
- Optimize performance for large datasets
- Troubleshoot problems
- Contribute to the project

**Feature Highlights:**
- 📅 Multi-month selector (single/double-click)
- 🏷️ Event type filters (15 presets)
- 💱 Currency toggle (Token/LUNA/USD)
- 🔍 Real-time search
- 👁️ Column visibility controls
- 📊 Interactive price charts
- 💰 Export to JSON/CSV

---

## 🎯 Quick Navigation by Goal

### I want to understand the big picture
→ Start with **Part 1: System Overview**

### I want to know how events are detected
→ Read **Part 2: Event Detection**

### I want to understand the money/token handling
→ Focus on **Part 3: Data Extraction**

### I want to add addresses to the directory
→ Check **Part 4: Address Directory**

### I want to learn how to use the explorer
→ Go to **Part 5: User Guide**

### I want to fix a bug or add a feature
→ Read **Parts 2 & 3** for logic, **Part 5** for interface

---

## 🔧 Technical Stack

### Frontend
- **HTML5** - Single file structure
- **Vanilla JavaScript** - No frameworks
- **Tailwind CSS** - Utility-first styling (CDN)
- **Google Fonts** - Inter & Fira Code

### Data Sources
- **GitHub Raw** - Transaction JSON files
- **CoinGecko API** - Real-time token prices
- **deving.zone API** - NFT status (broken NFTs)
- **Terra LCD** - Blockchain queries (optional)

### Architecture
- **Static Site** - No backend required
- **Client-Side** - All processing in browser
- **Cache-First** - localStorage for metadata
- **Lazy Loading** - On-demand chart rendering

---

## 📊 Current Statistics

**As of October 2025:**
- 10,000 NFTs tracked
- 25+ event types classified
- 1,000+ transactions per month
- 10+ token types supported
- 50+ known addresses
- 100% client-side processing

---

## 🚀 Getting Started

### For End Users
```bash
# 1. Download the explorer HTML file
# 2. Double-click to open in browser
# 3. Click "Current" month to load data
# That's it!
```

### For Developers
```bash
# 1. Clone repository
git clone https://github.com/defipatriot/nft_contract_transaction_tracker

# 2. Read documentation (this folder)
# 3. Open HTML in VS Code
# 4. Make changes
# 5. Test locally
# 6. Submit PR
```

### For Documentation Contributors
```bash
# 1. Fork transaction-tracker_docs repo
# 2. Edit relevant .md file
# 3. Follow existing format
# 4. Test all links
# 5. Submit PR
```

---

## 📝 Documentation Standards

### Writing Style
- ✅ Clear, concise explanations
- ✅ Code examples with comments
- ✅ Real transaction references
- ✅ Visual diagrams where helpful
- ✅ Step-by-step tutorials

### Code Examples
```javascript
// ✅ Good: Commented, realistic
function extractAmount(tx) {
  // Try message funds first
  const funds = tx.body.messages[0]?.funds;
  if (funds && funds.length > 0) {
    return funds[0].amount;
  }
  // Fallback to events
  return extractFromEvents(tx);
}

// ❌ Bad: No context, unclear
function get(tx) {
  return tx.body.messages[0].funds[0].amount;
}
```

### Updating Documentation
When code changes:
1. Update affected .md file(s)
2. Add to "What's New" section
3. Update version number
4. Test all code examples
5. Update screenshots if UI changed

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Client-Side Processing** - Large datasets (1000+ TXs) may be slow
2. **CoinGecko Rate Limits** - Prices limited to ~10 calls/minute
3. **Browser Memory** - Very large month loads may lag
4. **Mobile UX** - Table scrolling on small screens is awkward
5. **Historical Data** - Only back to Oct 2024 (when tracking began)

### Workarounds
1. Use event filters to reduce displayed data
2. Lazy-load charts (implemented in V4)
3. Load specific months, not all at once
4. Use desktop/tablet for best experience
5. More historical data added monthly

---

## 🔜 Planned Improvements

### Short-Term (Next 1-3 months)
- [ ] Advanced search with operators (AND, OR, NOT)
- [ ] Saved filter presets
- [ ] Dark/light theme toggle
- [ ] Export to PDF reports
- [ ] Mobile-optimized view

### Medium-Term (3-6 months)
- [ ] Real-time transaction monitoring (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] Custom chart builder
- [ ] Multi-collection support
- [ ] API for programmatic access

### Long-Term (6+ months)
- [ ] Server-side processing option
- [ ] Machine learning event classification
- [ ] Predictive market analytics
- [ ] Integration with Terra Station
- [ ] DAO governance features

---

## 🤝 Contributing

### How to Help

**Documentation:**
- Fix typos and unclear explanations
- Add more examples and diagrams
- Translate to other languages
- Improve code comments

**Code:**
- Fix bugs (check GitHub issues)
- Add requested features
- Improve performance
- Write tests

**Data:**
- Update address book
- Report wrong classifications
- Suggest new event types
- Validate historical data

**Community:**
- Answer questions in Discord
- Share usage tips
- Create tutorials/videos
- Report issues

### Contribution Guidelines
1. Read relevant documentation first
2. Discuss major changes before coding
3. Follow existing code style
4. Test thoroughly
5. Document your changes
6. Submit clean PRs

---

## 📞 Support & Contact

### Get Help
- **Discord:** Alliance DAO community server
- **GitHub Issues:** Bug reports and feature requests
- **Email:** Community moderators
- **Documentation:** You're reading it!

### Report Issues
```
Good issue format:

Title: [Brief description]

Description:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser/OS info
- Screenshots if relevant

Example TX hash: 8E6FC36BC4...
```

---

## 📜 License & Credits

### License
MIT License - Free to use, modify, and distribute

### Credits
**Developed by:** Alliance DAO Community  
**Primary Developer:** @defipatriot  
**Contributors:** See GitHub repository  
**Special Thanks:** 
- Terra blockchain team
- DAODao platform
- BBL Marketplace (Necropolis)
- Boost (LaunchNFT)
- NFT Switch
- CoinGecko API

---

## 🔗 Important Links

### Repositories
- [Explorer Source Code](https://github.com/defipatriot/nft_contract_transaction_tracker)
- [Transaction Data (2025)](https://github.com/defipatriot/adao_nft-tx_2025)
- [NFT Metadata](https://github.com/defipatriot/nft-metadata)
- [Address Book Config](https://github.com/defipatriot/transaction-tracker_docs)

### External Resources
- [Alliance DAO Website](https://alliancedao.io)
- [Terra Blockchain](https://www.terra.money)
- [Chainsco.pe Explorer](https://chainsco.pe/terra2)
- [CoinGecko](https://www.coingecko.com)

### Social
- [Discord Community](https://discord.gg/alliancedao)
- [Twitter/X](https://twitter.com/alliancedao)
- [GitHub Organization](https://github.com/defipatriot)

---

## 📅 Version History

### V2.0 Documentation (October 29, 2025)
- ✅ Complete rewrite for current implementation
- ✅ Added currency display system documentation
- ✅ CoinGecko optimization explained
- ✅ Token detection fix documented
- ✅ Interactive features guide
- ✅ Comprehensive user guide

### V1.0 Documentation (October 16, 2025)
- Initial documentation set
- 5-part structure established
- Core event detection logic
- Basic extraction patterns
- Original address directory

---

## 🎓 Learning Path

### Beginner
1. Read Part 5 (User Guide)
2. Open explorer and try features
3. Skim Part 1 (Overview) for context

### Intermediate
1. Read Part 1 (System Overview)
2. Read Part 5 (User Guide)
3. Experiment with filters and exports
4. Read Part 4 (Address Directory)

### Advanced
1. Read all 5 parts in order
2. Study source code alongside docs
3. Read Parts 2 & 3 carefully for logic
4. Try modifying the code
5. Contribute improvements

### Developer
1. Complete Advanced path
2. Set up development environment
3. Read code comments thoroughly
4. Check GitHub issues for tasks
5. Submit test PR with small improvement

---

## 💡 Pro Tips

### For Users
- Use event filters BEFORE searching for better performance
- Export data regularly for backup
- Hide reward claims for cleaner marketplace view
- Click amounts to see all currency conversions
- Double-click months to load multiple at once

### For Analysts
- Export to JSON for Python/Excel analysis
- Use currency toggle for consistent comparisons
- Track address statistics over time
- Note patterns in transaction timing
- Cross-reference with blockchain explorers

### For Developers
- Cache everything possible in localStorage
- Debounce search input for performance
- Use WeakMap for temporary data
- Lazy-load heavy resources
- Test with large datasets (1000+ TXs)

---

## 🏁 Conclusion

You now have access to **complete documentation** for the Alliance DAO NFT Transaction Explorer!

This documentation covers:
- ✅ System architecture and design decisions
- ✅ All 25 transaction event types
- ✅ Token handling and currency conversion
- ✅ Address resolution and human-readable names
- ✅ Complete user guide with best practices

**Next Steps:**
1. Read the part most relevant to your goal
2. Open the explorer and try features
3. Experiment with the examples
4. Join the community if you have questions
5. Contribute improvements!

**Happy exploring!** 🚀

---

**This documentation set represents the current state of the Alliance DAO NFT Transaction Explorer as of October 29, 2025, including all V4-COMPLETE features.**

---

## 📋 Quick Reference Card

```
═══════════════════════════════════════════════════════
 ALLIANCE DAO NFT TRANSACTION EXPLORER - QUICK REFERENCE
═══════════════════════════════════════════════════════

📊 KEY STATS
• 10,000 NFTs  • 25+ Event Types  • 3 Currency Modes

🔗 KEY CONTRACTS
• NFT:       terra1phr9fng...w3apw9
• ampLUNA:   terra1ecgazyd...mq2s5lvsct
• DAODao:    terra1c57ur37...am6qmvqx47
• BBL:       terra1ej4cv98...s7gccs9
• Boost:     terra1kj7pasy...tffx0vqspf4at

⌨️ KEYBOARD SHORTCUTS
• Ctrl+F    Focus search
• Ctrl+E    Event filter
• Ctrl+M    Month selector
• Ctrl+C    Currency toggle
• Ctrl+R    Reward claims
• Esc       Close modals

🎯 EVENT TYPES (25)
BBL: Listing, Sale, Delist, Offer
Boost: Listing, Sale, Transfer, Stake
DAO: Stake, Unstake, Claim
Alliance: Claim, Failed, Break
Switch: Batch, OTC (Create/Confirm/Complete)
Other: Manual Transfer

💱 CURRENCY MODES
• Token Mode  (249 bLUNA)
• LUNA Mode   (262.47 LUNA)
• USD Mode    ($1,240.53 USD)

📖 DOCUMENTATION
1. System Overview
2. Event Detection
3. Data Extraction
4. Address Directory
5. User Guide

🔧 SUPPORT
Discord: Alliance DAO community
GitHub: /defipatriot/nft_contract_transaction_tracker
Docs: This folder!

═══════════════════════════════════════════════════════
```

**Print this card or save it for quick reference!**

---

**END OF README** - Choose a part above to continue reading!
