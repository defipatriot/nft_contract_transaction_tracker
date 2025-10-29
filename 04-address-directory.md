# Alliance DAO NFT Transaction Explorer
## Address Directory & Human-Readable Names

**Version:** 2.0  
**Date:** October 29, 2025  
**Part:** 4 of 5

---

## Overview

The Explorer uses a comprehensive address directory to display human-readable names instead of raw Terra addresses. This dramatically improves user experience by showing "BBL Marketplace" instead of "terra1ej4cv98e...7gccs9".

---

## Address Directory Structure

### Format
```javascript
{
  "contracts": {
    "terra1abc...": {
      "name": "Display Name",
      "type": "contract_type",
      "description": "What this contract does",
      "url": "https://link-to-more-info"
    }
  },
  "wallets": {
    "terra1xyz...": {
      "name": "Holder Name",
      "category": "member|treasury|marketplace",
      "role": "Optional description"
    }
  }
}
```

---

## Core Protocol Contracts

### NFT & Rewards

```javascript
"terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9": {
  "name": "aDAO NFT Contract",
  "type": "cw721",
  "description": "Main Alliance DAO NFT collection (10,000 supply)",
  "icon": "🏛️"
},

"terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct": {
  "name": "ampLUNA Token",
  "type": "cw20",
  "description": "Reward token from Alliance staking",
  "icon": "📊"
}
```

---

## Governance Contracts

### DAODao System

```javascript
"terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47": {
  "name": "DAODao Staking",
  "type": "staking",
  "description": "Holds staked NFTs for governance voting",
  "icon": "🗳️",
  "totalStaked": "Updated daily",
  "url": "https://daodao.zone/dao/terra1..."
},

"terra14gv57x9lmuc04jzsmsz5f2heyfxfndey2v8hkkjt7z9p6d7xw35stx69j2": {
  "name": "DAODao Voting",
  "type": "governance",
  "description": "Tracks voting power and proposals",
  "icon": "✅"
}
```

---

## Marketplace Contracts

### BBL (Necropolis)

```javascript
"terra1ej4cv98e9g2zjefr5auf2nwtq4xl3dm7x0qml58yna2ml2hk595s7gccs9": {
  "name": "BBL Marketplace",
  "type": "marketplace",
  "description": "Necropolis marketplace - bLUNA only",
  "icon": "🏪",
  "paymentToken": "bLUNA",
  "fees": {
    "protocol": "2%",
    "royalty": "5%",
    "total": "7%"
  },
  "url": "https://www.necropolis.zone"
},

"terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml": {
  "name": "bLUNA Token",
  "type": "cw20",
  "description": "BBL marketplace payment token",
  "icon": "🔵"
}
```

### Boost (LaunchNFT)

```javascript
"terra1kj7pasyahtugajx9qud02r5jqaf60mtm7g5v9utr94rmdfftx0vqspf4at": {
  "name": "Boost Marketplace",
  "type": "marketplace",
  "description": "Multi-token marketplace platform",
  "icon": "🚀",
  "paymentToken": "Any",
  "fees": {
    "protocol": "2%",
    "royalty": "5%",
    "total": "7%"
  },
  "url": "https://www.boostdao.io"
},

"terra1rppeahhmtvy4fs9xr9zkjrf4xs9ak4ygy62slq": {
  "name": "Boost Protocol Fee",
  "type": "fee_wallet",
  "description": "Receives 2% marketplace fees",
  "icon": "💰"
}
```

### Boost Tools

```javascript
"terra1e54tcdyulrtslvf79htx4zntqntd4r550cg22sj24r6gfm0anrvq0y8tdv": {
  "name": "Boost Enterprise Tool",
  "type": "utility",
  "description": "Legacy NFT rescue from Enterprise DAO",
  "icon": "🔧",
  "status": "Active (decreasing usage)"
}
```

---

## NFT Switch

### OTC Trading Platform

```javascript
"terra1wm7rag4feqm2w3qfj85gsmn3g38mlxtfvu7zmsydnd8ez3dlkdks0n8yk0": {
  "name": "NFT Switch OTC",
  "type": "escrow",
  "description": "Private peer-to-peer trading contract",
  "icon": "🔄",
  "fees": {
    "buyer": "2%",
    "seller": "2%",
    "total": "4%",
    "royalty": "0%"
  },
  "url": "https://nftswitch.xyz"
},

"terra1hkqq2sy3dvvgt8sw2h0nfc3nzufa27d3xj69cf": {
  "name": "NFT Switch Operator",
  "type": "operator",
  "description": "Confirms and facilitates OTC trades",
  "icon": "✍️"
},

"terra1qdpyuvy9cjmelly6cf604ck7srpt040nee9cjy": {
  "name": "NFT Switch Fee Wallet",
  "type": "fee_wallet",
  "description": "Receives 4% OTC commission (2% each side)",
  "icon": "💵"
}
```

---

## DAO Treasury & Operations

```javascript
"terra1sffd4efk2jpdt894r04qwmtjqrrjfc52tmj6vkzjxqhd8qqu2drs3m5vzm": {
  "name": "Alliance DAO Treasury",
  "type": "treasury",
  "description": "Receives 5% royalty from BBL/Boost sales",
  "icon": "🏦",
  "revenue": "Tracks all royalty income"
}
```

---

## Known Alliance DAO Members

### Council Members

```javascript
"terra1abc123...": {
  "name": "Council Member #1",
  "category": "council",
  "role": "Core team",
  "discord": "username#1234"
},

"terra1def456...": {
  "name": "Council Member #2",
  "category": "council",
  "role": "Development"
}
```

### Whale Holders

```javascript
"terra1ghi789...": {
  "name": "Top Holder",
  "category": "whale",
  "nftCount": "500+",
  "note": "One of largest collections"
}
```

### Service Wallets

```javascript
"terra1jkl012...": {
  "name": "Marketing Wallet",
  "category": "service",
  "purpose": "Community rewards and giveaways"
},

"terra1mno345...": {
  "name": "Development Wallet",
  "category": "service",
  "purpose": "Technical infrastructure funding"
}
```

---

## Address Resolution Logic

### Priority System

```javascript
function resolveAddress(address) {
  // 1. Check contracts first (highest priority)
  if (addressBook.contracts[address]) {
    return {
      display: addressBook.contracts[address].name,
      icon: addressBook.contracts[address].icon,
      type: "contract",
      full: address
    };
  }
  
  // 2. Check known wallets
  if (addressBook.wallets[address]) {
    return {
      display: addressBook.wallets[address].name,
      icon: getIconForCategory(addressBook.wallets[address].category),
      type: "wallet",
      full: address
    };
  }
  
  // 3. Check if it's a DAO member (by NFT holdings)
  const memberInfo = checkDAOMembership(address);
  if (memberInfo) {
    return {
      display: `aDAO Member (${memberInfo.nftCount} NFTs)`,
      icon: "👤",
      type: "member",
      full: address
    };
  }
  
  // 4. Fallback to shortened address
  return {
    display: shortenAddress(address),
    icon: "👤",
    type: "unknown",
    full: address
  };
}
```

### Display Formatting

```javascript
function formatAddressWithName(address) {
  if (!address) return '<span class="text-gray-500">—</span>';
  
  const resolved = resolveAddress(address);
  
  return `
    <div class="address-display" onclick="copyToClipboard('${resolved.full}', '${resolved.display}')">
      <span class="address-icon">${resolved.icon}</span>
      <span class="address-name">${resolved.display}</span>
      <span class="address-copy-hint">📋</span>
    </div>
  `;
}

function shortenAddress(address) {
  if (!address) return "Unknown";
  return address.slice(0, 10) + "..." + address.slice(-6);
}

// Example outputs:
// "🏪 BBL Marketplace"
// "👤 Council Member #1"
// "👤 terra1abc...xyz123"
```

---

## Address Book Loading

### GitHub-Hosted Config

```javascript
const ADDRESS_BOOK_URL = "https://raw.githubusercontent.com/defipatriot/transaction-tracker_docs/main/alliance-dao-config.json";

async function loadAddressBook() {
  try {
    const response = await fetch(ADDRESS_BOOK_URL);
    const data = await response.json();
    
    // Store globally
    window.addressBook = data;
    
    console.log(`✅ Address book loaded: ${Object.keys(data.contracts).length} contracts, ${Object.keys(data.wallets).length} wallets`);
    
    return data;
  } catch (error) {
    console.error("❌ Failed to load address book:", error);
    return { contracts: {}, wallets: {} };
  }
}
```

### Caching Strategy

```javascript
// Cache in localStorage for faster subsequent loads
function loadAddressBookWithCache() {
  const CACHE_KEY = "adao_address_book";
  const CACHE_DURATION = 3600000;  // 1 hour
  
  const cached = localStorage.getItem(CACHE_KEY);
  const cacheTime = localStorage.getItem(CACHE_KEY + "_time");
  
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < CACHE_DURATION) {
    console.log("📦 Using cached address book");
    window.addressBook = JSON.parse(cached);
    return Promise.resolve(window.addressBook);
  }
  
  // Fetch fresh data
  return loadAddressBook().then(data => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_KEY + "_time", Date.now().toString());
    return data;
  });
}
```

---

## Special Address Patterns

### Detecting System Addresses

```javascript
function getAddressCategory(address) {
  // Contract addresses (start with terra1 + 59 chars)
  if (address.length === 63 && address.startsWith("terra1")) {
    return "contract";
  }
  
  // Wallet addresses (start with terra1 + 38 chars)
  if (address.length === 45 && address.startsWith("terra1")) {
    return "wallet";
  }
  
  // Validator addresses
  if (address.startsWith("terravaloper")) {
    return "validator";
  }
  
  return "unknown";
}
```

### Auto-Detection Helpers

```javascript
function detectMarketplace(address) {
  const marketplaces = {
    "terra1ej4cv98e...": "BBL",
    "terra1kj7pasy...": "Boost",
    "terra1wm7rag4f...": "NFT Switch"
  };
  
  return marketplaces[address] || null;
}

function detectStakingContract(address) {
  return address === "terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47";
}

function detectTreasury(address) {
  return address === "terra1sffd4efk2jpdt894r04qwmtjqrrjfc52tmj6vkzjxqhd8qqu2drs3m5vzm";
}
```

---

## Member Detection System

### Check DAO Membership

```javascript
async function checkDAOMembership(address) {
  // Query blockchain for NFT holdings
  const query = {
    tokens: {
      owner: address
    }
  };
  
  try {
    const response = await fetch(
      `https://terra-classic-lcd.publicnode.com/cosmwasm/wasm/v1/contract/${NFT_CONTRACT}/smart/${btoa(JSON.stringify(query))}`
    );
    
    const data = await response.json();
    const nftCount = data.data?.tokens?.length || 0;
    
    if (nftCount > 0) {
      return {
        isMember: true,
        nftCount: nftCount,
        category: nftCount >= 100 ? "whale" : nftCount >= 10 ? "holder" : "member"
      };
    }
    
    return { isMember: false };
  } catch (error) {
    console.error("Failed to check membership:", error);
    return { isMember: false };
  }
}
```

---

## Icon System

### Category Icons

```javascript
const CATEGORY_ICONS = {
  // Contracts
  "marketplace": "🏪",
  "staking": "🗳️",
  "governance": "✅",
  "utility": "🔧",
  "treasury": "🏦",
  "cw721": "🖼️",
  "cw20": "💰",
  
  // Wallets
  "council": "👑",
  "whale": "🐋",
  "holder": "👤",
  "member": "👥",
  "service": "🔧",
  "fee_wallet": "💵",
  
  // Platforms
  "BBL": "🏪",
  "Boost": "🚀",
  "NFTSwitch": "🔄",
  "DAODao": "🗳️",
  
  // Default
  "unknown": "👤"
};

function getIconForCategory(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.unknown;
}
```

---

## Address Validation

### Terra Address Format

```javascript
function isValidTerraAddress(address) {
  // Must start with "terra1"
  if (!address.startsWith("terra1")) return false;
  
  // Must be correct length
  const validLengths = [45, 63];  // Wallet or contract
  if (!validLengths.includes(address.length)) return false;
  
  // Must contain only valid characters
  const validChars = /^[a-z0-9]+$/;
  if (!validChars.test(address.slice(6))) return false;
  
  return true;
}
```

### Checksum Validation

```javascript
function validateAddressChecksum(address) {
  try {
    // Decode Bech32
    const decoded = bech32.decode(address);
    
    // Verify prefix
    if (decoded.prefix !== "terra") return false;
    
    // Checksum is valid if decode didn't throw
    return true;
  } catch (error) {
    return false;
  }
}
```

---

## Copy-to-Clipboard Integration

### One-Click Copy

```javascript
async function copyToClipboard(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`✅ Copied: ${label}`);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    
    // Fallback method
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    showToast(`✅ Copied: ${label}`);
    return true;
  }
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(45, 212, 191, 0.9);
    color: #0D0D0D;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
```

---

## Address Directory Updates

### Adding New Addresses

```javascript
// Process for adding to address book:

// 1. Identify new important address from transactions
// 2. Determine category (contract/wallet/member)
// 3. Add to alliance-dao-config.json
// 4. Push to GitHub repository
// 5. Explorer auto-loads new data within 1 hour

// Example new entry:
{
  "terra1new123...": {
    "name": "New Service",
    "category": "service",
    "description": "What this address does",
    "dateAdded": "2025-10-29"
  }
}
```

### Validation Script

```javascript
function validateAddressBook(addressBook) {
  const errors = [];
  
  // Check all contracts have required fields
  for (const [address, info] of Object.entries(addressBook.contracts)) {
    if (!isValidTerraAddress(address)) {
      errors.push(`Invalid contract address: ${address}`);
    }
    
    if (!info.name || !info.type || !info.description) {
      errors.push(`Missing fields for contract: ${address}`);
    }
  }
  
  // Check all wallets have required fields
  for (const [address, info] of Object.entries(addressBook.wallets)) {
    if (!isValidTerraAddress(address)) {
      errors.push(`Invalid wallet address: ${address}`);
    }
    
    if (!info.name || !info.category) {
      errors.push(`Missing fields for wallet: ${address}`);
    }
  }
  
  // Check for duplicates
  const allAddresses = [
    ...Object.keys(addressBook.contracts),
    ...Object.keys(addressBook.wallets)
  ];
  
  const duplicates = allAddresses.filter((addr, index) => 
    allAddresses.indexOf(addr) !== index
  );
  
  if (duplicates.length > 0) {
    errors.push(`Duplicate addresses: ${duplicates.join(", ")}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Address Analytics

### Tracking Address Activity

```javascript
function getAddressStats(address, transactions) {
  const stats = {
    address: address,
    name: resolveAddress(address).display,
    totalTransactions: 0,
    asStart: 0,
    asRecipient: 0,
    volumeSent: 0,
    volumeReceived: 0,
    nftsSent: 0,
    nftsReceived: 0,
    firstSeen: null,
    lastSeen: null
  };
  
  transactions.forEach(tx => {
    if (tx.sender === address) {
      stats.asSender++;
      stats.nftsSent += tx.nftCount;
      if (tx.amount) stats.volumeSent += parseInt(tx.amount);
    }
    
    if (tx.recipient === address) {
      stats.asRecipient++;
      stats.nftsReceived += tx.nftCount;
      if (tx.amount) stats.volumeReceived += parseInt(tx.amount);
    }
    
    if (tx.sender === address || tx.recipient === address) {
      stats.totalTransactions++;
      
      if (!stats.firstSeen || tx.timestamp < stats.firstSeen) {
        stats.firstSeen = tx.timestamp;
      }
      
      if (!stats.lastSeen || tx.timestamp > stats.lastSeen) {
        stats.lastSeen = tx.timestamp;
      }
    }
  });
  
  return stats;
}
```

---

## Next: Part 5

Continue to Part 5 for:
- Explorer Interface Features
- User Guide & Best Practices
- Troubleshooting Common Issues

---

**GitHub:** Save as `04-address-directory.md`
