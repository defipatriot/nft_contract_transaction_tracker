// ===== ADDRESS BOOK =====
let addressBook = {
    members: {},
    daos: {},
    contracts: {},
    validators: {},
    tokens: {}
};

// Load address book from GitHub
async function loadAddressBook() {
    try {
        console.log('📖 Loading address book from GitHub...');
        
        const response = await fetch(CONFIG.ADDRESS_BOOK_URL);
        
        if (!response.ok) {
            console.error('❌ Could not load address book, status:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        
        // Check if validators are nested under known_addresses
        if (data.known_addresses) {
            addressBook = {
                members: data.members || {},
                daos: data.known_addresses.daos || {},
                contracts: data.known_addresses.contracts || {},
                validators: data.known_addresses.validators || {},
                platforms: data.known_addresses.platforms || {},
                tokens: data.tokens || {}
            };
        } else if (data.validators || data.daos || data.contracts || data.members) {
            // Structure has sections at root level
            addressBook = data;
            addressBook.tokens = data.tokens || {};
        } else {
            // Might be wrapped in a parent object
            addressBook = {
                members: data.members || {},
                daos: data.daos || {},
                contracts: data.contracts || {},
                validators: data.validators || {},
                tokens: data.tokens || {}
            };
        }
        
        const counts = {
            members: Object.keys(addressBook.members || {}).length,
            daos: Object.keys(addressBook.daos || {}).length,
            contracts: Object.keys(addressBook.contracts || {}).length,
            validators: Object.keys(addressBook.validators || {}).length,
            tokens: Object.keys(addressBook.tokens || {}).length
        };
        
        console.log('✅ Address book loaded successfully:', counts);
        
        // Warn if validators missing
        if (!addressBook.validators || Object.keys(addressBook.validators).length === 0) {
            console.warn('⚠️ No validators found in address book!');
        }
    } catch (error) {
        console.error('❌ Error loading address book:', error);
        console.error('❌ Error details:', error.message, error.stack);
    }
}

// Lookup address in address book
function lookupAddress(address) {
    if (!address) return null;
    
    const lowerAddr = address.toLowerCase();
    
    // Check all sections
    const sections = [
        { name: 'members', data: addressBook.members },
        { name: 'daos', data: addressBook.daos },
        { name: 'contracts', data: addressBook.contracts },
        { name: 'validators', data: addressBook.validators }
    ];
    
    for (const section of sections) {
        if (section.data && section.data[address]) {
            return section.data[address];
        }
        // Also check lowercase
        for (const [key, value] of Object.entries(section.data || {})) {
            if (key.toLowerCase() === lowerAddr) {
                return value;
            }
        }
    }
    
    return null;
}

// Get token logo HTML from address book
function getTokenLogo(symbol) {
    if (!symbol || !addressBook.tokens) return '';
    
    // Try to find token by symbol
    for (const [address, tokenData] of Object.entries(addressBook.tokens)) {
        if (tokenData.symbol === symbol && tokenData.logo) {
            return `<img src="${tokenData.logo}" 
                         alt="${symbol}" 
                         class="inline-block w-4 h-4 rounded-full mr-1.5 -mt-0.5"
                         style="vertical-align: middle;"
                         onerror="this.style.display='none'"
                         title="${tokenData.name}">`;
        }
    }
    return '';
}

// Format address with name and logo if available
function formatAddressDisplay(address, options = {}) {
    const {
        showLogo = false,
        showFullAddress = false,
        clickToCopy = true,
        linkToChainscope = false
    } = options;
    
    if (!address) return '<span class="text-gray-500">—</span>';
    
    const info = lookupAddress(address);
    const displayAddr = showFullAddress ? address : `${address.substring(0, 12)}...${address.slice(-6)}`;
    const isValidator = address.startsWith('terravaloper');
    const addrPrefix = isValidator ? 'terrav...' : 'terra1...';
    const shortAddr = isValidator ? 
        `${address.substring(0, 13)}...${address.slice(-4)}` : 
        `${address.substring(0, 12)}...${address.slice(-6)}`;
    
    if (!info) {
        // No info, just show address
        if (linkToChainscope) {
            return `<a href="https://chainsco.pe/terra2/address/${address}" target="_blank" 
                       class="font-mono text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                       ${shortAddr}
                       <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                       </svg>
                    </a>`;
        }
        return `<span class="font-mono text-xs ${clickToCopy ? 'copyable cursor-pointer hover:text-cyan-400' : ''}" 
                      ${clickToCopy ? `onclick="copyToClipboard('${address}')" title="${address}"` : ''}>
                      ${shortAddr}
                </span>`;
    }
    
    // Has info - show name and optionally logo
    const logo = (showLogo && info.logo) ? `<img src="${info.logo}" alt="${info.name}" class="inline-block w-5 h-5 rounded-full mr-1">` : '';
    const displayName = info.name || info.handle || 'Unknown';
    
    if (linkToChainscope) {
        return `<a href="https://chainsco.pe/terra2/address/${address}" target="_blank" 
                   class="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 group"
                   title="Click to view on Chainsco.pe">
                   ${logo}
                   <div class="flex flex-col">
                       <span class="font-semibold text-sm">${displayName}</span>
                       <span class="font-mono text-xs text-gray-500 group-hover:text-gray-400">${shortAddr}</span>
                   </div>
                   <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                   </svg>
                </a>`;
    }
    
    return `<span class="${clickToCopy ? 'copyable cursor-pointer hover:text-cyan-400' : ''} flex items-center gap-1 group" 
                  ${clickToCopy ? `onclick="copyToClipboard('${address}')" title="Click to copy full address"` : ''}>
               ${logo}
               <span class="font-semibold text-sm">${displayName}</span>
               <span class="font-mono text-xs text-gray-500 group-hover:text-gray-400">${shortAddr}</span>
            </span>`;
}

// ===== GITHUB CONFIGURATION =====
const GITHUB_CONFIG = {
    baseURL: "https://raw.githubusercontent.com/defipatriot/adao_nft-tx_YEAR/main/",
    enabled: true, // Set to false to disable auto-load
    currentYear: new Date().getFullYear()
};

// Rate Limiting Configuration
const RATE_LIMIT = {
    maxBlocksWithoutPassword: 10,
    password: "freeDO"
};
let requestHistory = []; // Track timestamps of block loads
let passwordValidUntil = 0; // Timestamp when password validation expires (5 minutes)

// Global State
let currentBatch = [];
let filteredTransactions = [];
let existingMonthData = null; // Track loaded JSON for merging
let imagesVisible = true; // Track image visibility state
let loadedFromGitHub = false; // Track if data loaded from GitHub
let currentMonth = new Date().getMonth() + 1; // 1-12
let currentYear = new Date().getFullYear();
let selectedMonths = new Set(); // Track selected months
let loadedMonthsData = new Map(); // Track which months have data loaded (month -> transactions array)
let selectedEvents = new Set(['ALL']); // Track selected event types
let showRewardClaims = true; // Track reward claims visibility - DEFAULT TO VISIBLE
let currentFilter = 'ALL';
let transactionCache = {};
let nftMetadata = [];
let nftStatus = {}; // Store NFT status (broken, staked, etc.)
let showRewards = false; // Toggle for showing reward claims
let currentTokenIndex = 0;
let isLoadingNextMonth = false; // Flag to prevent data clearing during Load Next Month
let lunaPrice = 0;
let tokenPrice = 0;
let currentPage = 1;
let batchSize = 100;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    startClocks();
    await Promise.all([
        loadNFTMetadata(),
        loadNFTStatus(),
        loadAddressBook()  // Load address book from GitHub
    ]);
    setupModalHandlers();
    
    // Initialize selectors
    initMonthSelector();
    initEventFilter();
    
    // Set current year in dropdown
    const now = new Date();
    currentYear = now.getFullYear();
    document.getElementById('year-selector').value = currentYear;
    
    // Auto-load current month from GitHub if enabled
    if (GITHUB_CONFIG.enabled) {
        loadSelectedMonths(); // Load "Current" which is selected by default
    } else {
        updateStatus('Ready! Enable GitHub auto-load in config, or paste block heights to load transactions.');
    }
});

// Clock Functions
function startClocks() {
    // Initialize timezone selector from localStorage
    const savedTimezone = localStorage.getItem('selectedTimezone') || 'auto';
    document.getElementById('timezone-selector').value = savedTimezone;
    selectedTimezone = savedTimezone;
    
    updateClocks();
    setInterval(updateClocks, 1000);
    setInterval(updateAuthStatus, 60000); // Update auth status every minute
}

// Selected timezone (stored in localStorage)
let selectedTimezone = localStorage.getItem('selectedTimezone') || 'auto';

function updateClocks() {
    const now = new Date();
    
    // UTC Time
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    document.getElementById('utc-clock').textContent = `${utcHours}:${utcMinutes}:${utcSeconds}`;
    
    // UTC Date
    const utcMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(now.getUTCDate()).padStart(2, '0');
    const utcYear = now.getUTCFullYear();
    document.getElementById('utc-date').textContent = `${utcMonth}/${utcDay}/${utcYear}`;
    
    // Get UTC hours as number for difference calculation
    const utcHoursNum = now.getUTCHours();
    let localHoursNum;
    
    // Local Time (with timezone support)
    let localTime;
    if (selectedTimezone === 'auto') {
        localTime = now;
        localHoursNum = localTime.getHours();
    } else {
        // Use Intl.DateTimeFormat to get time in selected timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: selectedTimezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        const parts = formatter.formatToParts(now);
        const timeParts = {};
        parts.forEach(part => {
            timeParts[part.type] = part.value;
        });
        
        localHoursNum = parseInt(timeParts.hour);
        
        document.getElementById('local-clock').textContent = `${timeParts.hour}:${timeParts.minute}:${timeParts.second}`;
        document.getElementById('local-date').textContent = `${timeParts.month}/${timeParts.day}/${timeParts.year}`;
        
        // Calculate and display time difference
        updateTimeDifference(utcHoursNum, localHoursNum);
        return;
    }
    
    // Auto-detect local time
    const localHours = String(localTime.getHours()).padStart(2, '0');
    const localMinutes = String(localTime.getMinutes()).padStart(2, '0');
    const localSeconds = String(localTime.getSeconds()).padStart(2, '0');
    document.getElementById('local-clock').textContent = `${localHours}:${localMinutes}:${localSeconds}`;
    
    // Local Date
    const localMonth = String(localTime.getMonth() + 1).padStart(2, '0');
    const localDay = String(localTime.getDate()).padStart(2, '0');
    const localYear = localTime.getFullYear();
    document.getElementById('local-date').textContent = `${localMonth}/${localDay}/${localYear}`;
    
    // Calculate and display time difference
    updateTimeDifference(utcHoursNum, localHoursNum);
}

// Update time difference display
function updateTimeDifference(utcHours, localHours) {
    let diff = localHours - utcHours;
    
    // Handle day boundary crossing
    if (diff > 12) {
        diff = diff - 24;
    } else if (diff < -12) {
        diff = diff + 24;
    }
    
    const diffEl = document.getElementById('time-difference');
    if (diff === 0) {
        diffEl.textContent = 'Same Time';
    } else if (diff > 0) {
        diffEl.textContent = `+${diff} Hrs`;
    } else {
        diffEl.textContent = `${diff} Hrs`;
    }
}

// Timezone selector change handler
function onTimezoneChange() {
    selectedTimezone = document.getElementById('timezone-selector').value;
    localStorage.setItem('selectedTimezone', selectedTimezone);
    updateClocks();
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Utility Functions
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatAddress(addr) {
    if (!addr || addr.length < 12) return addr || 'N/A';
    return `${addr.substring(0, 7)}...${addr.substring(addr.length - 4)}`;
}

// Format address with human-readable name from address book
function formatAddressWithName(address) {
    if (!address || address === 'N/A') {
        return '<span class="text-gray-500">—</span>';
    }
    
    const info = lookupAddress(address);
    const shortAddr = formatAddress(address);
    
    if (info) {
        // We have info about this address
        let displayName = info.handle || info.name || shortAddr;
        let badgeClass = 'bg-cyan-600';
        let icon = '';
        
        // Different styling based on type
        if (info.type === 'validator') {
            badgeClass = 'bg-purple-600';
            icon = '⚡';
        } else if (info.type === 'dao') {
            badgeClass = 'bg-blue-600';
            icon = '🏛️';
        } else if (info.type === 'contract') {
            badgeClass = 'bg-orange-600';
            icon = '📜';
        } else if (info.handle) {
            badgeClass = 'bg-green-600';
            icon = '👤';
        }
        
        return `
            <div class="flex items-center gap-2">
                <span class="px-2 py-1 rounded text-xs font-semibold ${badgeClass} text-white whitespace-nowrap" 
                      title="${info.name || displayName}">
                    ${icon} ${displayName}
                </span>
                <span class="copyable font-mono text-xs text-gray-400" 
                      onclick="copyToClipboard('${address}', 'Address: ${address}')" 
                      title="Click to copy: ${address}">
                    ${shortAddr}
                </span>
            </div>
        `;
    }
    
    // No info, just show address
    return `<span class="copyable font-mono text-sm" 
                   onclick="copyToClipboard('${address}', 'Address: ${address}')" 
                   title="${address}">${shortAddr}</span>`;
}

function formatTxHash(hash) {
    if (!hash || hash.length < 12) return hash || 'N/A';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

function formatAmountDisplay(amount) {
    if (!amount) return amount;
    
    // Extract the numeric part and token (e.g., "249.000000 LUNA")
    const parts = amount.split(' ');
    if (parts.length !== 2) return amount;
    
    const number = parseFloat(parts[0]);
    const token = parts[1];
    
    // Remove unnecessary trailing zeros
    // If it's a whole number, show no decimals
    // If it has decimals, show up to 2 significant decimal places
    let formatted;
    if (number % 1 === 0) {
        formatted = number.toFixed(0);
    } else {
        // Remove trailing zeros after decimal point
        formatted = number.toFixed(6).replace(/\.?0+$/, '');
    }
    
    // Look up token info to get full name
    let tokenName = token; // Default to symbol
    if (addressBook.tokens) {
        for (const [address, tokenData] of Object.entries(addressBook.tokens)) {
            if (tokenData.symbol === token) {
                tokenName = tokenData.name;
                break;
            }
        }
    }
    
    // Add token logo if available
    const logo = getTokenLogo(token);
    
    // If token name is different from symbol, add hover title
    if (tokenName !== token) {
        return `${logo}<span title="${tokenName}">${formatted} ${token}</span>`;
    }
    
    return `${logo}${formatted} ${token}`;
}

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toUTCString().replace(' GMT', ' UTC');
}

function formatTimestampWrapped(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${month}/${day}/${year}<br>${hours}:${minutes}:${seconds}`;
}

function formatTimeAgo(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} year${Math.floor(interval) > 1 ? 's' : ''} ago`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} day${Math.floor(interval) > 1 ? 's' : ''} ago`;
    
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hour${Math.floor(interval) > 1 ? 's' : ''} ago`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minute${Math.floor(interval) > 1 ? 's' : ''} ago`;
    
    return `${Math.floor(seconds)} second${Math.floor(seconds) !== 1 ? 's' : ''} ago`;
}

function getEventBadgeClass(eventType) {
    if (eventType.includes('BREAK') || eventType.includes('BURN')) return 'badge-break';
    if (eventType.includes('TRANSFER') && !eventType.includes('UNSTAKE')) return 'badge-transfer';
    if (eventType.includes('STAKE') && !eventType.includes('UNSTAKE') && !eventType.includes('CLAIM')) return 'badge-stake';
    if (eventType.includes('UNSTAKE') || eventType.includes('CLAIM_NFTS')) return 'badge-unstake';
    if (eventType.includes('SALE') || eventType.includes('SETTLE')) return 'badge-sale';
    if (eventType.includes('BID') || eventType.includes('OFFER')) return 'badge-purchase';
    if (eventType.includes('LISTING') || eventType.includes('SETUP') || eventType.includes('AUCTION')) return 'badge-listing';
    if (eventType.includes('DELIST') || eventType.includes('CANCEL')) return 'badge-delist';
    if (eventType.includes('CLAIM_FAILED') || eventType.includes('FAILED')) return 'badge-claim-failed';
    if (eventType.includes('CLAIM') || eventType.includes('ALLIANCE')) return 'badge-claim';
    return 'badge-other';
}

// Format event type: Remove underscores and convert to title case
function formatEventType(eventType) {
    return eventType
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
}

function decodeBase64(str) {
    try {
        if (str && /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0) {
            return atob(str);
        }
    } catch (e) {}
    return str;
}

// Load NFT Metadata
async function loadNFTMetadata() {
    try {
        console.log('Loading NFT metadata from:', CONFIG.NFT_METADATA_URL);
        const response = await fetch(CONFIG.NFT_METADATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        nftMetadata = await response.json();
        console.log(`✅ Loaded ${nftMetadata.length} NFT metadata entries`);
    } catch (error) {
        console.error('❌ Error loading NFT metadata:', error);
        nftMetadata = [];
    }
}

async function loadNFTStatus() {
    try {
        console.log('Loading NFT status from:', CONFIG.NFT_STATUS_URL);
        const response = await fetch(CONFIG.NFT_STATUS_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const statusData = await response.json();
        
        // Handle both array and object responses
        if (Array.isArray(statusData)) {
            // Convert array to object for faster lookups: { "1": {...}, "2": {...}, ... }
            nftStatus = statusData.reduce((acc, nft) => {
                acc[nft.id] = nft;
                return acc;
            }, {});
        } else {
            // Already an object, use it directly
            nftStatus = statusData;
        }
        
        console.log(`✅ Loaded status for ${Object.keys(nftStatus).length} NFTs`);
        
        // Count broken NFTs from object
        const brokenCount = Object.values(nftStatus).filter(n => n.broken).length;
        if (brokenCount > 0) {
            console.log(`📊 ${brokenCount} NFTs are currently broken`);
        }
    } catch (error) {
        console.error('❌ Error loading NFT status:', error);
        nftStatus = {};
    }
}

function isNFTBroken(tokenId) {
    const status = nftStatus[parseInt(tokenId)];
    return status?.broken === true;
}

function getNFTImage(tokenId) {
    const parsedId = parseInt(tokenId);
    const nft = nftMetadata.find(n => n.id === parsedId);
    
    if (nft?.image) {
        // Convert IPFS URLs to gateway URLs
        if (nft.image.startsWith('ipfs://')) {
            const ipfsHash = nft.image.replace('ipfs://', '');
            const gatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
            return gatewayUrl;
        }
        return nft.image;
    }
    
    console.warn(`No image found for NFT #${tokenId}`);
    return 'https://via.placeholder.com/60?text=NFT';
}

function getNFTName(tokenId) {
    const nft = nftMetadata.find(n => n.id === parseInt(tokenId));
    return nft?.name || `NFT #${tokenId}`;
}

// Load from Known Block Heights
// Check rate limit and prompt for password if needed
function checkRateLimit(blockCount) {
    const now = Date.now();
    
    // Check if password is still valid (5 minutes)
    if (now < passwordValidUntil) {
        updateAuthStatus();
        return true; // Password already authenticated
    }
    
    // If 10 or fewer blocks, allow without password
    if (blockCount <= RATE_LIMIT.maxBlocksWithoutPassword) {
        return true;
    }
    
    // More than 10 blocks - require password
    const password = prompt(`🔐 Loading ${blockCount} blocks requires authentication.\n\nEnter password to continue:`);
    
    if (password === RATE_LIMIT.password) {
        // Password valid for 5 minutes
        passwordValidUntil = now + (5 * 60 * 1000);
        updateAuthStatus();
        showToast('✅ Authentication successful! Valid for 5 minutes', 'success');
        return true;
    } else if (password !== null) {
        // User entered wrong password (null means they cancelled)
        showToast('❌ Incorrect password', 'error');
    }
    
    return false;
}

// Update authentication status display
function updateAuthStatus() {
    const statusEl = document.getElementById('auth-status');
    if (!statusEl) return;
    
    const now = Date.now();
    if (now < passwordValidUntil) {
        const minutesLeft = Math.ceil((passwordValidUntil - now) / 60000);
        statusEl.textContent = `✓ Authenticated (${minutesLeft}m remaining)`;
        statusEl.className = 'text-green-400';
    } else {
        statusEl.textContent = 'Not authenticated';
        statusEl.className = 'text-yellow-400';
    }
}

async function loadFromBlockHeights() {
    const input = document.getElementById('block-heights-input').value.trim();
    
    if (!input) {
        showToast('Please enter block heights');
        return;
    }
    
    document.getElementById('loading').style.display = 'block';
    updateStatus('Parsing block heights...');
    
    try {
        // Parse input - accept comma or newline separated
        const heights = input
            .split(/[\n,]+/)
            .map(h => h.trim())
            .filter(h => h.length > 0)
            .map(h => parseInt(h))
            .filter(h => !isNaN(h) && h > 0);
        
        if (heights.length === 0) {
            showToast('No valid block heights found');
            document.getElementById('loading').style.display = 'none';
            return;
        }
        
        // Check rate limit
        if (!checkRateLimit(heights.length)) {
            document.getElementById('loading').style.display = 'none';
            updateStatus('Ready');
            return;
        }
        
        console.log(`Processing ${heights.length} block heights:`, heights);
        updateStatus(`Loading transactions from ${heights.length} blocks...`);
        
        const allTxs = [];
        let blocksProcessed = 0;
        
        for (const height of heights) {
            try {
                // Use LCD API with query parameter (TESTED AND WORKING!)
                const url = `${CONFIG.LCD_API}/cosmos/tx/v1beta1/txs?query=tx.height=${height}&pagination.limit=100`;
                
                console.log(`Querying block ${height}:`, url);
                const response = await fetch(url);
                
                if (!response.ok) {
                    console.error(`Block ${height}: HTTP ${response.status}`);
                    blocksProcessed++;
                    continue;
                }
                
                const data = await response.json();
                const totalTxs = data.tx_responses?.length || 0;
                
                console.log(`Block ${height}: Found ${totalTxs} total transactions`);
                
                if (totalTxs > 0) {
                    // Filter for our contract
                    const contractTxs = data.tx_responses.filter(tx => {
                        const txStr = JSON.stringify(tx);
                        return txStr.includes(CONFIG.NFT_CONTRACT);
                    });
                    
                    if (contractTxs.length > 0) {
                        allTxs.push(...contractTxs);
                        console.log(`✓ Block ${height}: Found ${contractTxs.length} contract transactions!`);
                    } else {
                        console.log(`✗ Block ${height}: No contract transactions (checked ${totalTxs} txs)`);
                    }
                }
                
                blocksProcessed++;
                if (blocksProcessed % 10 === 0) {
                    updateStatus(`Processed ${blocksProcessed}/${heights.length} blocks, found ${allTxs.length} transactions...`);
                }
                
                // Small delay every 10 blocks
                if (blocksProcessed % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (err) {
                console.error(`Error loading block ${height}:`, err);
            }
        }
        
        console.log(`Loaded ${allTxs.length} transactions from ${blocksProcessed} blocks`);
        
        if (allTxs.length > 0) {
            updateStatus(`Processing ${allTxs.length} transactions...`);
            const newTransactions = await processLCDTransactions(allTxs);
            
            // MERGE with existing GitHub data instead of replacing
            console.log(`🔗 Merging ${newTransactions.length} new transactions with ${filteredTransactions.length} existing`);
            
            // Track which months have new data
            const monthsWithNewData = new Set();
            newTransactions.forEach(tx => {
                const date = new Date(tx.timestamp);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthsWithNewData.add(monthKey);
            });
            
            // Store months with new data for export
            window.monthsWithNewData = monthsWithNewData;
            console.log('📅 Months with new transactions:', Array.from(monthsWithNewData));
            
            // Remove duplicates before merging
            const existingHashes = new Set(filteredTransactions.map(tx => tx.hash));
            const uniqueNewTxs = newTransactions.filter(tx => !existingHashes.has(tx.hash));
            
            console.log(`✨ Adding ${uniqueNewTxs.length} unique new transactions (${newTransactions.length - uniqueNewTxs.length} duplicates skipped)`);
            
            // Merge into filteredTransactions
            filteredTransactions.push(...uniqueNewTxs);
            
            // Sort by block height descending
            filteredTransactions.sort((a, b) => parseInt(b.height) - parseInt(a.height));
            
            // Also update currentBatch for backward compatibility
            currentBatch = [...filteredTransactions];
            currentPage = 0;
            document.getElementById('current-batch').textContent = 'Merged';
            
            // Render in main table
            renderResults();
            
            updateStatus(`✅ Merged ${uniqueNewTxs.length} new transactions | Total: ${filteredTransactions.length}`);
            showToast(`Success! Added ${uniqueNewTxs.length} new transactions (${monthsWithNewData.size} months affected)`);
        } else {
            updateStatus('No contract transactions found in specified blocks');
            showToast('No transactions found');
        }
        
    } catch (error) {
        console.error('Error loading from block heights:', error);
        updateStatus('Error: ' + error.message);
        showToast('Error: ' + error.message);
        currentBatch = [];
        filterTransactions('ALL');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Check for duplicate blocks
function checkForDuplicates() {
    const input = document.getElementById('block-heights-input').value.trim();
    if (!input) {
        showToast('⚠️ Please paste block numbers first');
        return;
    }
    
    if (filteredTransactions.length === 0) {
        showToast('ℹ️ No existing data loaded - all blocks are new');
        return;
    }
    
    // Parse input blocks
    const inputBlocks = input
        .split(/[\s,]+/)
        .map(b => b.trim())
        .filter(b => b && /^\d+$/.test(b))
        .map(b => parseInt(b));
    
    if (inputBlocks.length === 0) {
        showToast('⚠️ No valid block numbers found');
        return;
    }
    
    // Get existing block heights
    const existingBlocks = new Set(
        filteredTransactions.map(tx => parseInt(tx.height))
    );
    
    // Find new blocks
    const newBlocks = inputBlocks.filter(block => !existingBlocks.has(block));
    const duplicateCount = inputBlocks.length - newBlocks.length;
    
    if (newBlocks.length === 0) {
        showToast(`✅ All ${inputBlocks.length} blocks already loaded - nothing new to add`);
        document.getElementById('block-heights-input').value = '';
        return;
    }
    
    // Update textarea with only new blocks
    document.getElementById('block-heights-input').value = newBlocks.join(', ');
    
    showToast(`🔍 Found ${newBlocks.length} new blocks (removed ${duplicateCount} duplicates)`);
    updateStatus(`Ready to load ${newBlocks.length} new block(s). Click "Load Transactions" when ready.`);
}

// Load Transactions by Batch - Query exact blocks one at a time
async function loadBatch(batchNumber) {
    document.getElementById('loading').style.display = 'block';
    updateStatus(`Loading batch ${batchNumber}...`);
    
    try {
        console.log(`Loading batch ${batchNumber}...`);
        
        // Get current block height
        updateStatus('Getting current block height...');
        const statusResponse = await fetch(`${CONFIG.RPC_URL}/status`);
        const statusData = await statusResponse.json();
        const currentHeight = parseInt(statusData.result.sync_info.latest_block_height);
        console.log('Current block height:', currentHeight);
        
        // Calculate which blocks to scan for this batch
        const blocksToScan = 1000; // Scan 1000 blocks per batch
        const startHeight = currentHeight - (batchNumber * blocksToScan);
        const endHeight = currentHeight - ((batchNumber - 1) * blocksToScan);
        
        console.log(`Scanning blocks ${startHeight} to ${endHeight}`);
        updateStatus(`Scanning blocks ${startHeight} to ${endHeight}...`);
        
        const allTxs = [];
        let blocksScanned = 0;
        let blocksWithTxs = 0;
        
        // Scan blocks one at a time (RPC requires exact height)
        for (let height = endHeight; height >= startHeight && allTxs.length < batchSize; height--) {
            try {
                // Query for transactions at this EXACT height
                const query = `tx.height=${height}`;
                const url = `${CONFIG.RPC_URL}/tx_search?query=${encodeURIComponent(query)}&per_page=100`;
                
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.result?.txs && data.result.txs.length > 0) {
                        // Filter for our contract address
                        const contractTxs = data.result.txs.filter(tx => {
                            const txStr = JSON.stringify(tx);
                            return txStr.includes(CONFIG.NFT_CONTRACT);
                        });
                        
                        if (contractTxs.length > 0) {
                            allTxs.push(...contractTxs);
                            blocksWithTxs++;
                            console.log(`Block ${height}: Found ${contractTxs.length} contract txs`);
                        }
                    }
                }
                
                blocksScanned++;
                if (blocksScanned % 50 === 0) {
                    updateStatus(`Scanned ${blocksScanned}/${blocksToScan} blocks, found ${allTxs.length} transactions...`);
                }
                
                // Small delay to avoid overwhelming the RPC
                if (blocksScanned % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (err) {
                console.log(`Error scanning block ${height}:`, err);
            }
        }
        
        console.log(`Scanned ${blocksScanned} blocks, found ${allTxs.length} contract transactions in ${blocksWithTxs} blocks`);
        
        if (allTxs.length > 0) {
            updateStatus(`Processing ${allTxs.length} transactions...`);
            
            // Take only the first batchSize transactions
            const txsToProcess = allTxs.slice(0, batchSize);
            currentBatch = await processTransactions(txsToProcess);
            currentPage = batchNumber;
            document.getElementById('current-batch').textContent = batchNumber;
            
            // Reset to Show All filter
            currentFilter = 'ALL';
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === 'ALL') {
                    btn.classList.add('active');
                }
            });
            
            filterTransactions('ALL');
            updateStatus(`Loaded ${currentBatch.length} transactions from ${blocksWithTxs} blocks`);
            showToast(`Loaded batch ${batchNumber}: ${currentBatch.length} transactions`);
        } else {
            console.log('No transactions found in block range');
            currentBatch = [];
            filterTransactions('ALL');
            updateStatus(`No contract transactions found in blocks ${startHeight}-${endHeight}`);
            showToast('No transactions found in this range');
        }
    } catch (error) {
        console.error('Error loading batch:', error);
        updateStatus('Error: ' + error.message);
        showToast('Error: ' + error.message);
        currentBatch = [];
        filterTransactions('ALL');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function updateStatus(message) {
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
        statusEl.textContent = message;
    }
}

// Process LCD format transactions
async function processLCDTransactions(txs) {
    console.log('===== PROCESSING', txs.length, 'TRANSACTIONS =====');
    const processed = [];
    
    for (const txResponse of txs) {
        console.log('Processing tx:', txResponse.txhash);
        const height = parseInt(txResponse.height);
        const txHash = txResponse.txhash;
        const timestamp = txResponse.timestamp;
        
        // Get the actual tx data
        const tx = txResponse.tx || {};
        
        // Classify event
        const eventType = classifyLCDEvent(txResponse);
        console.log('Event type:', eventType);
        
        // Extract all data
        const sender = extractLCDSender(tx);
        const tokenIds = extractLCDTokenIds(txResponse);
        const price = extractLCDPrice(txResponse);
        console.log('Extracted price:', price);
        const rewards = extractLCDRewards(txResponse);
        console.log('Extracted rewards:', rewards);
        const fees = extractLCDFees(txResponse);
        console.log('Extracted fees:', fees);
        const recipient = extractLCDRecipient(txResponse);
        console.log('Extracted recipient:', recipient);
        const seller = extractLCDSeller(txResponse);
        console.log('Extracted seller:', seller);
        
        // Determine buyer/seller based on event type
        const isSale = eventType.includes('SALE') || eventType.includes('PURCHASE');
        const isListing = eventType.includes('LISTING');
        const isClaim = eventType.includes('CLAIM');
        const isStake = eventType.includes('STAKE') && !eventType.includes('UNSTAKE');
        const isOTCCreate = eventType === 'NFTSWITCH_OTC_CREATE';
        const isOTCComplete = eventType === 'NFTSWITCH_OTC_COMPLETE';
        
        let finalBuyer = sender;
        let finalSeller = null;
        let claimDetails = null;
        let displayAmount = rewards || price;
        
        // Handle reward claims specially
        if (isClaim && rewards && typeof rewards === 'object' && rewards.type === 'detailed') {
            console.log('📊 Processing CLAIM with detailed rewards:', rewards);
            claimDetails = rewards;
            displayAmount = rewards.formatted;
            finalBuyer = rewards.recipient || sender;
            finalSeller = rewards.recipient || sender; // Same address for claims
            console.log('Display amount set to:', displayAmount);
        } else if (isOTCCreate) {
            // For OTC CREATE: show listing amount, no buyer yet (sender is the creator/seller)
            finalBuyer = null;
            finalSeller = sender;
            // Try to extract ask tokens from create_trade message
            const otcAmount = extractOTCListingAmount(txResponse);
            displayAmount = otcAmount || price;
            console.log('OTC CREATE - Listing amount:', displayAmount);
        } else if (isOTCComplete) {
            // For OTC COMPLETE: only show buyer (sender), extract payment from execute_trade funds
            finalBuyer = sender;
            finalSeller = null;
            // Extract payment amount from OTC completion
            const otcAmount = extractOTCListingAmount(txResponse);
            displayAmount = otcAmount || price;
            console.log('OTC COMPLETE - Buyer:', finalBuyer, 'Amount:', displayAmount);
        } else if (isStake) {
            // For stakes: only show sender (staker), no recipient or price
            finalBuyer = sender;
            finalSeller = null;
            displayAmount = null;
        } else if (isSale) {
            // For sales: sender = buyer, seller = who got paid
            finalBuyer = sender;
            finalSeller = seller || recipient;
        } else if (isListing) {
            // For listings: sender = seller (person listing), buyer = empty
            finalBuyer = null;
            finalSeller = sender;
        } else {
            // For other transactions (transfers, stakes, etc)
            finalBuyer = sender;
            finalSeller = recipient;
        }
        
        processed.push({
            hash: txHash,
            height: height,
            timestamp: timestamp,
            eventType: eventType,
            sender: finalBuyer,  // Buyer for sales, sender for others
            recipient: finalSeller,  // Seller for sales/listings, recipient for others
            tokenIds: tokenIds,
            nftCount: isClaim ? 'N/A' : tokenIds.length,
            price: price,
            rewards: rewards,
            claimDetails: claimDetails,  // Detailed claim info
            amount: displayAmount,  // Use formatted amount for display
            fees: fees,
            rawTx: txResponse
        });
    }
    
    console.log('===== PROCESSED', processed.length, 'TRANSACTIONS =====');
    return processed.sort((a, b) => b.height - a.height);
}

function classifyLCDEvent(txResponse) {
    try {
        const rawStr = JSON.stringify(txResponse).toLowerCase();
        const tx = txResponse.tx || {};
        const body = tx.body || {};
        const messages = body.messages || [];
        const memo = (body.memo || '').toLowerCase();
        
        // Check for common patterns
        const isBoostMemo = memo.includes('boostdao.io');
        const isNFTSwitchMemo = memo.includes('nftswitch');
        const isBBLMemo = memo.includes('backbone labs') || 
                         memo.includes('backbonelabs') || 
                         memo.includes('necropolis');
        
        // 1. ALLY REWARDS CLAIM
        if (rawStr.includes('claim_rewards') && rawStr.includes(CONFIG.NFT_CONTRACT.toLowerCase())) {
            if (txResponse.code !== 0) {
                return 'ALLY_REWARDS_CLAIM_FAILED';
            }
            return 'ALLIANCE_CLAIM';
        }
        
        // 2. NFT BREAK
        if (rawStr.includes('break_nft')) {
            return 'NFT_BREAK';
        }
        
        // 3-6. DAODAO OPERATIONS
        const isDaoDao = rawStr.includes(CONFIG.DAODAO_STAKING.toLowerCase()) || 
                        rawStr.includes('terra1c57ur376');
        
        if (isDaoDao) {
            if (rawStr.includes('claim_nfts')) {
                return 'DAODAO_CLAIM_NFTS';
            }
            if (rawStr.includes('unstake')) {
                return 'DAODAO_UNSTAKE';
            }
            if (rawStr.includes('send_nft') || rawStr.includes('"action":"stake"')) {
                // Check if via Boost
                if (isBoostMemo) {
                    return 'BOOST_STAKE_DAODAO';
                }
                return 'DAODAO_STAKE';
            }
        }
        
        // 7-9. ENTERPRISE OPERATIONS (Legacy - only unstaking/claiming)
        const isEnterprise = rawStr.includes(CONFIG.ENTERPRISE_TOOL.toLowerCase()) ||
                           rawStr.includes('terra1e54tcdyu');
        
        if (isEnterprise) {
            // Enterprise is shut down - only claiming/unstaking is possible
            if (rawStr.includes('claim')) {
                // Check if Boost recovery tool
                if (isBoostMemo) {
                    return 'ENTERPRISE_UNSTAKE_BOOST';
                }
                return 'ENTERPRISE_CLAIM_NFTS';
            }
            if (rawStr.includes('unstake')) {
                return 'ENTERPRISE_UNSTAKE';
            }
            // No staking - Enterprise is shut down
        }
        
        // 10-13. BBL MARKETPLACE
        const isBBL = rawStr.includes('terra1ej4cv98e9g2zjefr5auf2nwtq4xl3dm7x0qml58yna2ml2hk595s7gccs9') || 
                     rawStr.includes(CONFIG.BBL_MARKETPLACE.toLowerCase()) ||
                     isBBLMemo;
        
        if (isBBL) {
            if (rawStr.includes('make_collection_offer')) {
                return 'BBL_COLLECTION_OFFER';
            }
            if (rawStr.includes('accept_collection_offer')) {
                return 'BBL_COLLECTION_OFFER_ACCEPTED';
            }
            // Check cancel_auction BEFORE settle (cancel txs also have settle_hook)
            if (rawStr.includes('cancel_auction') || rawStr.includes('"cancel"')) {
                return 'BBL_DELIST';
            }
            if (rawStr.includes('settle')) {
                return 'BBL_SALE';
            }
            if (rawStr.includes('place_bid')) {
                return 'BBL_BID';
            }
            if (rawStr.includes('create_auction') || (rawStr.includes('send_nft') && isBBL)) {
                return 'BBL_LISTING';
            }
        }
        
        // 14-16. BOOST MARKETPLACE & TOOLS
        const isBoost = rawStr.includes(CONFIG.BOOST_PROTOCOL.toLowerCase()) ||
                      rawStr.includes('terra1ss4tkg2de') ||
                      isBoostMemo ||
                      rawStr.includes('launch-nft');
        
        if (isBoost) {
            // Boost Sale (two messages: increase_allowance + deposit)
            if (rawStr.includes('deposit') && messages.length >= 2) {
                return 'BOOST_SALE';
            }
            // Boost Cancel
            if (rawStr.includes('"cancel"') || rawStr.includes('launch-nft/cancel')) {
                return 'BOOST_CANCEL';
            }
            // Boost Listing
            if (rawStr.includes('setup') || rawStr.includes('launch-nft/setup')) {
                return 'BOOST_LISTING';
            }
            // Boost Transfer (transfer_nft with Boost memo, not to marketplace/staking)
            if (rawStr.includes('transfer_nft') && isBoostMemo) {
                const recipient = messages[0]?.msg?.transfer_nft?.recipient?.toLowerCase();
                const isToMarketplace = recipient?.includes('terra1ej4cv98e') || 
                                       recipient?.includes('terra1ss4tkg2de') ||
                                       recipient?.includes('terra1c57ur376') ||
                                       recipient?.includes('terra1e54tcdyu');
                if (!isToMarketplace) {
                    return 'BOOST_TRANSFER';
                }
            }
        }
        
        // 17-20. NFT SWITCH
        const isNFTSwitch = rawStr.includes(CONFIG.NFT_SWITCH.toLowerCase()) ||
                          rawStr.includes(CONFIG.OTC_CONTRACT.toLowerCase()) ||
                          rawStr.includes('terra1c22qq8c5') ||
                          rawStr.includes('terra1wm7rag4feq') ||
                          isNFTSwitchMemo;
        
        if (isNFTSwitch) {
            // OTC Complete
            if (rawStr.includes('execute_trade')) {
                return 'NFTSWITCH_OTC_COMPLETE';
            }
            // OTC Confirm
            if (rawStr.includes('confirm_trade')) {
                return 'NFTSWITCH_OTC_CONFIRM';
            }
            // OTC Create (approve + create_trade)
            if (rawStr.includes('create_trade') || 
                (rawStr.includes('approve') && messages.length >= 2)) {
                return 'NFTSWITCH_OTC_CREATE';
            }
            // NFT Switch regular marketplace
            if (rawStr.includes('deposit') && rawStr.includes('solid')) {
                return 'NFTSWITCH_SALE';
            }
            if (rawStr.includes('"cancel"')) {
                return 'NFTSWITCH_CANCEL';
            }
            if (rawStr.includes('setup')) {
                return 'NFTSWITCH_LISTING';
            }
            // Batch Transfer (multiple transfer_nft messages with NFT Switch memo)
            if (messages.length > 1 && isNFTSwitchMemo) {
                const allTransfers = messages.every(m => m.msg?.transfer_nft);
                if (allTransfers) {
                    // Check same recipient
                    const recipients = messages.map(m => m.msg?.transfer_nft?.recipient);
                    const uniqueRecipients = new Set(recipients.filter(r => r));
                    if (uniqueRecipients.size === 1) {
                        return 'NFTSWITCH_BATCH_TRANSFER';
                    }
                }
            }
        }
        
        // 21. P2P TRANSFER (must be last - only if no marketplace/staking/tools involved)
        if (rawStr.includes('transfer_nft')) {
            // Make sure it's not going to a known contract
            const recipient = messages[0]?.msg?.transfer_nft?.recipient?.toLowerCase();
            const hasKnownContract = isDaoDao || isEnterprise || isBBL || isBoost || isNFTSwitch;
            const hasToolMemo = isBoostMemo || isNFTSwitchMemo;
            
            if (!hasKnownContract && !hasToolMemo && recipient) {
                // Final check: recipient is not a marketplace/staking address
                const isToContract = recipient.includes('terra1ej4cv98e') || // BBL
                                   recipient.includes('terra1ss4tkg2de') || // Boost
                                   recipient.includes('terra1c57ur376') || // DAODao
                                   recipient.includes('terra1e54tcdyu') || // Enterprise
                                   recipient.includes('terra1c22qq8c5') || // NFT Switch
                                   recipient.includes('terra1wm7rag4feq'); // NFT Switch OTC
                
                if (!isToContract) {
                    return 'P2P_TRANSFER';
                }
            }
        }
        
        // FALLBACK: Generic patterns from events
        if (txResponse.events) {
            for (const event of txResponse.events) {
                if (event.type === 'wasm') {
                    for (const attr of event.attributes || []) {
                        if (attr.key === 'action') {
                            const action = attr.value.toLowerCase();
                            if (action.includes('stake') && !action.includes('unstake')) {
                                return 'GENERIC_STAKE';
                            }
                            if (action.includes('unstake') || action.includes('claim_nft')) {
                                return 'GENERIC_UNSTAKE';
                            }
                            if (action.includes('claim')) {
                                return 'REWARD_CLAIM';
                            }
                        }
                    }
                }
            }
        }

        return 'UNKNOWN_EVENT';
    } catch (error) {
        console.error('Error classifying LCD event:', error);
        console.error('Error stack:', error.stack);
        console.error('Transaction:', txResponse.txhash);
        return 'ERROR_CLASSIFYING';
    }
}

function extractLCDSender(tx) {
    try {
        if (tx?.body?.messages && tx.body.messages.length > 0) {
            return tx.body.messages[0].sender || 'Unknown';
        }
        return 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

function extractLCDTokenIds(txResponse) {
    const tokenIds = new Set();
    
    try {
        const tx = txResponse.tx || {};
        const messages = tx.body?.messages || [];
        
        // Check messages first
        for (const msg of messages) {
            // Direct token_id in send_nft
            if (msg.msg?.send_nft?.token_id) {
                tokenIds.add(msg.msg.send_nft.token_id);
                console.log('Found token_id in send_nft:', msg.msg.send_nft.token_id);
            }
            
            // Also decode the msg field if it exists (BBL listings)
            if (msg.msg?.send_nft?.msg) {
                try {
                    const decodedMsg = atob(msg.msg.send_nft.msg);
                    const parsedMsg = JSON.parse(decodedMsg);
                    if (parsedMsg.create_auction?.token_id) {
                        tokenIds.add(parsedMsg.create_auction.token_id);
                        console.log('Found token_id in decoded msg:', parsedMsg.create_auction.token_id);
                    }
                } catch (e) {
                    // Ignore decode errors
                }
            }
            
            // Check transfer_nft
            if (msg.msg?.transfer_nft?.token_id) {
                tokenIds.add(msg.msg.transfer_nft.token_id);
            }
        }
        
        // Check logs
        if (txResponse.logs) {
            for (const log of txResponse.logs) {
                if (log.events) {
                    for (const event of log.events) {
                        if (event.attributes) {
                            for (const attr of event.attributes) {
                                if (attr.key === 'token_id' && attr.value.match(/^\d+$/)) {
                                    tokenIds.add(attr.value);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Also check top-level events array (LCD format)
        if (txResponse.events) {
            for (const event of txResponse.events) {
                if (event.attributes) {
                    for (const attr of event.attributes) {
                        if (attr.key === 'token_id' && attr.value.match(/^\d+$/)) {
                            tokenIds.add(attr.value);
                            console.log('Found token_id in events:', attr.value);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error extracting LCD token IDs:', error);
    }

    console.log('Total token IDs found:', Array.from(tokenIds));
    return Array.from(tokenIds);
}

// Extract Price/Amount from transaction
function extractLCDPrice(txResponse) {
    try {
        const tx = txResponse.tx || {};
        const body = tx.body || {};
        const messages = body.messages || [];
        const logs = txResponse.logs || [];
        
        console.log('=== PRICE EXTRACTION DEBUG ===');
        console.log('TX Hash:', txResponse.txhash);
        const eventType = classifyLCDEvent(txResponse);
        console.log('Event Type:', eventType);
        console.log('Number of messages:', messages.length);
        console.log('Number of logs:', logs.length);
        
        // No price for cancelled/delisted listings
        if (eventType === 'BBL_DELIST') {
            console.log('BBL_DELIST event - no price');
            return null;
        }
        
        // Special handling for OTC transactions
        if (eventType === 'NFTSWITCH_OTC_CREATE') {
            console.log('OTC_CREATE: Will use extractOTCListingAmount');
            // Price will be extracted by extractOTCListingAmount in the main processing
            return null; // Don't extract here, let the special handler do it
        }
        
        if (eventType === 'NFTSWITCH_OTC_COMPLETE') {
            console.log('OTC_COMPLETE: Looking for payment in events...');
            // Look for the actual payment in coin_spent/transfer events
            // Fall through to normal price extraction logic below
        }
        
        // Check messages for listing price
        for (const msg of messages) {
            if (msg.msg) {
                const msgStr = JSON.stringify(msg.msg);
                console.log('Message:', msgStr.substring(0, 200));
                
                // BBL/Boost listing - decode base64 msg field
                if (msg.msg.send_nft && msg.msg.send_nft.msg) {
                    try {
                        const decodedMsg = atob(msg.msg.send_nft.msg);
                        console.log('Decoded send_nft msg:', decodedMsg);
                        const parsedMsg = JSON.parse(decodedMsg);
                        
                        // BBL listing format - use reserve price (actual listing price)
                        if (parsedMsg.create_auction) {
                            const auction = parsedMsg.create_auction;
                            
                            // Reserve_price is the actual listing price (BBL uses reserve_price with underscore)
                            if (auction.reserve_price && auction.denom) {
                                console.log('Found BBL reserve_price:', auction.reserve_price, auction.denom);
                                return formatAmount(auction.reserve_price, auction.denom);
                            }
                            
                            // Also check reserve without underscore (fallback)
                            if (auction.reserve && auction.denom) {
                                console.log('Found BBL reserve:', auction.reserve, auction.denom);
                                return formatAmount(auction.reserve, auction.denom);
                            }
                            
                            // Fallback to start_price if no reserve
                            if (auction.start_price) {
                                const price = auction.start_price;
                                console.log('Found BBL start_price:', price);
                                return formatAmount(price.amount, price.denom);
                            }
                        }
                    } catch (e) {
                        console.log('Error decoding msg:', e);
                    }
                }
                
                // Direct price in message
                if (msgStr.includes('"price"')) {
                    const priceMatch = msgStr.match(/"price"\s*:\s*\{\s*"amount"\s*:\s*"(\d+)"\s*,\s*"denom"\s*:\s*"([^"]+)"/);
                    if (priceMatch) {
                        console.log('Found price in message:', priceMatch[1], priceMatch[2]);
                        return formatAmount(priceMatch[1], priceMatch[2]);
                    }
                }
            }
        }
        
        // Check logs for actual transfer amounts (sales)
        for (const log of logs) {
            for (const event of log.events || []) {
                console.log('Event type:', event.type);
                
                // Look for coin_spent or transfer events (payment happened)
                if (event.type === 'coin_spent' || event.type === 'transfer') {
                    const amountAttr = event.attributes?.find(a => a.key === 'amount');
                    console.log('Found amount attr:', amountAttr?.value);
                    if (amountAttr && amountAttr.value) {
                        // Parse amounts like "1000000uluna" or "500000000ibc/..."
                        const match = amountAttr.value.match(/^(\d+)(.+)$/);
                        if (match && parseInt(match[1]) > 100000) { // Filter out tiny amounts
                            console.log('Extracted price:', match[1], match[2]);
                            return formatAmount(match[1], match[2]);
                        }
                    }
                }
                
                // Look for wasm events with price/sale_price
                if (event.type === 'wasm') {
                    for (const attr of event.attributes || []) {
                        if (attr.key === 'price' || attr.key === 'sale_price' || attr.key === 'amount') {
                            console.log('Found wasm price attr:', attr.key, '=', attr.value);
                            if (attr.value && attr.value.match(/^\d+/)) {
                                // Try to find associated denom
                                const denomAttr = event.attributes.find(a => a.key === 'denom');
                                if (denomAttr) {
                                    console.log('With denom:', denomAttr.value);
                                    return formatAmount(attr.value, denomAttr.value);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Also check top-level events (LCD format) for BBL sales
        if (txResponse.events) {
            for (const event of txResponse.events) {
                if (event.type === 'wasm') {
                    const actionAttr = event.attributes?.find(a => a.key === 'action');
                    // Look for settle action with amount
                    if (actionAttr && actionAttr.value === 'settle') {
                        const amountAttr = event.attributes.find(a => a.key === 'amount');
                        const denomAttr = event.attributes.find(a => a.key === 'denom');
                        if (amountAttr && amountAttr.value) {
                            console.log('Found settle amount in top-level events:', amountAttr.value);
                            if (denomAttr && denomAttr.value) {
                                return formatAmount(amountAttr.value, denomAttr.value);
                            } else {
                                // No denom, likely CW20 token address - just show amount
                                return (parseInt(amountAttr.value) / 1000000).toFixed(2) + ' TOKEN';
                            }
                        }
                    }
                }
            }
        }
        
        console.log('No price found');
        return null;
    } catch (error) {
        console.error('Error extracting price:', error);
        return null;
    }
}

// Extract Rewards (for Alliance Claims) - FIXED VERSION
function extractLCDRewards(txResponse) {
    try {
        const logs = txResponse.logs || [];
        const topEvents = txResponse.events || [];
        const validatorClaims = []; // Array of {validator, amount}
        let totalLunaClaimed = 0;
        let ampLunaAmount = null;
        let stakingValidator = null;
        let recipient = null;
        let rewardsCollected = null; // User portion before treasury take
        let treasuryAmount = null; // DAO treasury take
        let treasuryAddress = null; // Where treasury funds go
        
        console.log('🔍 REWARD EXTRACTION: Starting...');
        console.log('Number of logs:', logs.length);
        console.log('Number of top-level events:', topEvents.length);
        
        // Combine events from both logs and top-level
        const allEvents = [];
        
        // Get events from logs
        for (const log of logs) {
            if (log.events) {
                allEvents.push(...log.events);
            }
        }
        
        // Also check top-level events
        allEvents.push(...topEvents);
        
        console.log('Total events to process:', allEvents.length);
        
        // First pass: collect all withdraw_rewards (claims from validators)
        for (const event of allEvents) {
            if (event.type === 'withdraw_rewards') {
                const validatorAttr = event.attributes?.find(a => a.key === 'validator');
                const amountAttr = event.attributes?.find(a => a.key === 'amount');
                
                if (validatorAttr?.value && amountAttr?.value) {
                    const match = amountAttr.value.match(/^(\d+)uluna$/);
                    if (match) {
                        const amount = (parseInt(match[1]) / 1000000).toFixed(6);
                        validatorClaims.push({
                            validator: validatorAttr.value,
                            amount: amount,
                            amountRaw: match[1]
                        });
                        console.log(`✅ Claim from validator: ${amount} LUNA`);
                    }
                }
            }
        }
        
        // Second pass: find the delegate event which has the ACTUAL total LUNA amount
        for (const event of allEvents) {
            if (event.type === 'delegate') {
                console.log('✅ Found delegate event');
                const amountAttr = event.attributes?.find(a => a.key === 'amount');
                const validatorAttr = event.attributes?.find(a => a.key === 'validator');
                
                // Get the ACTUAL total LUNA from delegate event
                if (amountAttr?.value) {
                    const match = amountAttr.value.match(/^(\d+)uluna$/);
                    if (match) {
                        totalLunaClaimed = parseFloat((parseInt(match[1]) / 1000000).toFixed(6));
                        console.log('✅ Total LUNA delegated:', totalLunaClaimed);
                    }
                }
                
                if (validatorAttr?.value) {
                    stakingValidator = validatorAttr.value;
                    console.log('✅ Staking validator:', stakingValidator);
                }
            }
            
            // Extract minted ampLUNA
            if (event.type === 'wasm') {
                const actionAttr = event.attributes?.find(a => a.key === 'action');
                const amountAttr = event.attributes?.find(a => a.key === 'amount');
                const toAttr = event.attributes?.find(a => a.key === 'to');
                
                if (actionAttr?.value === 'mint' && amountAttr?.value) {
                    ampLunaAmount = (parseInt(amountAttr.value) / 1000000).toFixed(6);
                    console.log('✅ Extracted ampLUNA minted:', ampLunaAmount);
                }
                
                if (toAttr?.value) {
                    recipient = toAttr.value;
                    console.log('✅ Extracted recipient:', recipient);
                }
                
                // Extract DAO treasury split from update_rewards_callback
                if (actionAttr?.value === 'update_rewards_callback') {
                    const rewardsAttr = event.attributes?.find(a => a.key === 'rewards_collected');
                    const treasuryAttr = event.attributes?.find(a => a.key === 'treasury_amount');
                    
                    if (rewardsAttr?.value) {
                        rewardsCollected = (parseInt(rewardsAttr.value) / 1000000).toFixed(6);
                        console.log('✅ Rewards collected (user portion):', rewardsCollected);
                    }
                    
                    if (treasuryAttr?.value) {
                        treasuryAmount = (parseInt(treasuryAttr.value) / 1000000).toFixed(6);
                        console.log('✅ Treasury amount (DAO take):', treasuryAmount);
                    }
                }
                
                // Extract treasury address from ampLUNA transfer to treasury
                if (actionAttr?.value === 'transfer' && toAttr?.value && treasuryAmount) {
                    // Check if this transfer matches the treasury amount
                    if (amountAttr?.value) {
                        const transferAmount = (parseInt(amountAttr.value) / 1000000).toFixed(6);
                        if (transferAmount === treasuryAmount) {
                            treasuryAddress = toAttr.value;
                            console.log('✅ Treasury address:', treasuryAddress);
                        }
                    }
                }
            }
        }
        
        // Return detailed claim info
        if (ampLunaAmount && validatorClaims.length > 0) {
            const result = {
                type: 'detailed',
                ampLunaTotal: ampLunaAmount,  // Total minted
                ampLunaUser: rewardsCollected, // User receives
                ampLunaTreasury: treasuryAmount, // DAO take
                treasuryAddress: treasuryAddress, // DAO treasury address
                totalLuna: totalLunaClaimed.toFixed(6),
                validatorCount: validatorClaims.length, // Number of validators claimed from
                validatorClaims: validatorClaims,
                stakingValidator: stakingValidator,
                recipient: recipient,
                formatted: `${rewardsCollected || ampLunaAmount} ampLUNA` // Show user amount in table
            };
            console.log('✅ REWARD EXTRACTION RESULT:', result);
            return result;
        }
        
        // Fallback for other claim types
        if (ampLunaAmount) {
            return {
                type: 'detailed',
                ampLunaTotal: ampLunaAmount,
                ampLunaUser: rewardsCollected,
                ampLunaTreasury: treasuryAmount,
                treasuryAddress: treasuryAddress,
                totalLuna: totalLunaClaimed.toFixed(6),
                validatorCount: validatorClaims.length,
                stakingValidator: stakingValidator,
                recipient: recipient,
                formatted: `${rewardsCollected || ampLunaAmount} ampLUNA`
            };
        }
        
        console.log('❌ No rewards found');
        return null;
    } catch (error) {
        console.error('Error extracting rewards:', error);
        return null;
    }
}

// Extract Fees from transaction
function extractLCDFees(txResponse) {
    try {
        const logs = txResponse.logs || [];
        const tx = txResponse.tx || {};
        let protocolFee = null;
        let royaltyFee = null;
        let gasFee = null;
        
        // Check for protocol and royalty fees in events
        for (const log of logs) {
            for (const event of log.events || []) {
                if (event.type === 'wasm') {
                    for (const attr of event.attributes || []) {
                        if (attr.key === 'protocol_fee' || attr.key === 'marketplace_fee') {
                            protocolFee = attr.value;
                        }
                        if (attr.key === 'royalty_fee' || attr.key === 'royalty') {
                            royaltyFee = attr.value;
                        }
                    }
                }
            }
        }
        
        // Get gas fee
        const fee = tx.auth_info?.fee?.amount?.[0];
        if (fee) {
            gasFee = formatAmount(fee.amount, fee.denom);
        }
        
        // Combine fees
        const fees = [];
        if (protocolFee) fees.push(`P: ${protocolFee}`);
        if (royaltyFee) fees.push(`R: ${royaltyFee}`);
        if (gasFee) fees.push(`G: ${gasFee}`);
        
        return fees.length > 0 ? fees.join(' | ') : null;
    } catch (error) {
        console.error('Error extracting fees:', error);
        return null;
    }
}

// Extract Recipient Address (for sales = buyer, for transfers = receiver)
function extractLCDRecipient(txResponse) {
    try {
        const tx = txResponse.tx || {};
        const body = tx.body || {};
        const messages = body.messages || [];
        const logs = txResponse.logs || [];
        
        console.log('=== RECIPIENT EXTRACTION DEBUG ===');
        console.log('TX Hash:', txResponse.txhash);
        
        // For marketplace sales, look for the NFT transfer TO the buyer
        // Check logs first (most reliable for sales)
        for (const log of logs) {
            for (const event of log.events || []) {
                if (event.type === 'wasm') {
                    console.log('Checking wasm event attributes...');
                    // Look for transfer_nft action with recipient
                    const actionAttr = event.attributes?.find(a => a.key === 'action');
                    console.log('Action:', actionAttr?.value);
                    if (actionAttr && (actionAttr.value === 'transfer_nft' || actionAttr.value === 'send_nft')) {
                        const recipientAttr = event.attributes.find(a => a.key === 'recipient' || a.key === 'to');
                        console.log('Found recipient in wasm:', recipientAttr?.value);
                        if (recipientAttr && recipientAttr.value) {
                            return recipientAttr.value;
                        }
                    }
                    
                    // BBL specific - look for buyer
                    const buyerAttr = event.attributes?.find(a => a.key === 'buyer');
                    console.log('Buyer attr:', buyerAttr?.value);
                    if (buyerAttr && buyerAttr.value) {
                        return buyerAttr.value;
                    }
                }
            }
        }
        
        // Also check top-level events array (LCD format)
        if (txResponse.events) {
            for (const event of txResponse.events) {
                if (event.type === 'wasm') {
                    const actionAttr = event.attributes?.find(a => a.key === 'action');
                    if (actionAttr && (actionAttr.value === 'transfer_nft' || actionAttr.value === 'send_nft')) {
                        const recipientAttr = event.attributes.find(a => a.key === 'recipient' || a.key === 'to');
                        console.log('Found recipient in top-level events:', recipientAttr?.value);
                        if (recipientAttr && recipientAttr.value) {
                            return recipientAttr.value;
                        }
                    }
                }
            }
        }
        
        // Check messages for direct transfers
        for (const msg of messages) {
            if (msg.msg) {
                console.log('Checking message:', JSON.stringify(msg.msg).substring(0, 100));
                if (msg.msg.transfer_nft?.recipient) {
                    console.log('Found in transfer_nft:', msg.msg.transfer_nft.recipient);
                    return msg.msg.transfer_nft.recipient;
                }
                if (msg.msg.send_nft?.recipient) {
                    console.log('Found in send_nft:', msg.msg.send_nft.recipient);
                    return msg.msg.send_nft.recipient;
                }
                if (msg.msg.recipient) {
                    console.log('Found in msg.recipient:', msg.msg.recipient);
                    return msg.msg.recipient;
                }
            }
        }
        
        console.log('No recipient found');
        return null;
    } catch (error) {
        console.error('Error extracting recipient:', error);
        return null;
    }
}

// Extract Seller Address (who received payment in marketplace sales)
function extractLCDSeller(txResponse) {
    try {
        const logs = txResponse.logs || [];
        
        // Look for coin transfer/receive events to find who got paid
        for (const log of logs) {
            for (const event of log.events || []) {
                // Look for transfer events (payment)
                if (event.type === 'transfer') {
                    const recipientAttr = event.attributes?.find(a => a.key === 'recipient');
                    const senderAttr = event.attributes?.find(a => a.key === 'sender');
                    
                    // The seller is who receives tokens (not from marketplace contract)
                    if (recipientAttr && recipientAttr.value) {
                        const recipient = recipientAttr.value;
                        // Filter out marketplace contract addresses and fee collectors
                        if (!recipient.includes('terra1ej4cv98e') && // BBL
                            !recipient.includes('terra1ss4tkg2de') && // Boost
                            !recipient.includes('terra1c22qq8c5') && // NFT Switch
                            !recipient.startsWith('terra1') === false) { // Must be terra address
                            return recipient;
                        }
                    }
                }
                
                // Wasm events might have seller info
                if (event.type === 'wasm') {
                    const sellerAttr = event.attributes?.find(a => a.key === 'seller' || a.key === 'owner');
                    if (sellerAttr && sellerAttr.value) {
                        return sellerAttr.value;
                    }
                }
            }
        }
        
        // Also check top-level events (LCD format) for BBL sales
        if (txResponse.events) {
            for (const event of txResponse.events) {
                if (event.type === 'wasm') {
                    const actionAttr = event.attributes?.find(a => a.key === 'action');
                    // Look for settle action with seller
                    if (actionAttr && actionAttr.value === 'settle') {
                        const sellerAttr = event.attributes.find(a => a.key === 'seller');
                        if (sellerAttr && sellerAttr.value) {
                            console.log('Found seller in top-level events:', sellerAttr.value);
                            return sellerAttr.value;
                        }
                    }
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error extracting seller:', error);
        return null;
    }
}

// Extract OTC Listing Amount (for NFT Switch OTC CREATE transactions)
function extractOTCListingAmount(txResponse) {
    try {
        const tx = txResponse.tx || {};
        const body = tx.body || {};
        const messages = body.messages || [];
        const logs = txResponse.logs || [];
        const eventType = classifyLCDEvent(txResponse);
        
        console.log('=== OTC LISTING AMOUNT EXTRACTION ===');
        console.log('Event type:', eventType);
        console.log('Messages:', messages.length);
        console.log('Full TX JSON:', JSON.stringify(txResponse, null, 2));
        
        // For OTC_CREATE: Look for create_trade message with ask_tokens
        if (eventType === 'NFTSWITCH_OTC_CREATE') {
            for (const msg of messages) {
                if (msg.msg) {
                    console.log('Checking message:', JSON.stringify(msg.msg).substring(0, 200));
                    
                    // Direct create_trade in msg
                    if (msg.msg.create_trade) {
                        const createTrade = msg.msg.create_trade;
                        console.log('Found create_trade:', JSON.stringify(createTrade));
                        
                        // Check for sale_price (NFT Switch OTC format)
                        if (createTrade.sale_price) {
                            const salePrice = createTrade.sale_price;
                            console.log('Found sale_price:', JSON.stringify(salePrice));
                            
                            if (salePrice.amount && salePrice.denom) {
                                console.log('✅ Found OTC listing price:', salePrice.amount, salePrice.denom);
                                return formatAmount(salePrice.amount, salePrice.denom);
                            }
                        }
                        
                        // Check for ask_tokens array (alternative format)
                        if (createTrade.ask_tokens && Array.isArray(createTrade.ask_tokens)) {
                            const askTokens = createTrade.ask_tokens;
                            console.log('Ask tokens:', askTokens);
                            
                            // Get the first ask token (usually only one)
                            if (askTokens.length > 0) {
                                const firstAsk = askTokens[0];
                                
                                // Check if it's a native coin (LUNA)
                                if (firstAsk.native) {
                                    const amount = firstAsk.native.amount;
                                    const denom = firstAsk.native.denom;
                                    console.log('✅ Found native ask token:', amount, denom);
                                    return formatAmount(amount, denom);
                                }
                                
                                // Check if it's a CW20 token
                                if (firstAsk.cw20) {
                                    const amount = firstAsk.cw20.amount;
                                    const address = firstAsk.cw20.address;
                                    console.log('✅ Found CW20 ask token:', amount, 'at', address);
                                    return formatAmount(amount, address);
                                }
                            }
                        }
                    }
                    
                    // Check if create_trade is inside execute_contract
                    if (msg.msg.execute_contract) {
                        try {
                            const execMsg = msg.msg.execute_contract;
                            console.log('Found execute_contract');
                            
                            // The msg might be a JSON string or object
                            let innerMsg = execMsg.msg;
                            if (typeof innerMsg === 'string') {
                                innerMsg = JSON.parse(innerMsg);
                            }
                            
                            if (innerMsg.create_trade) {
                                const createTrade = innerMsg.create_trade;
                                console.log('Found create_trade in execute_contract:', JSON.stringify(createTrade));
                                
                                // Check for sale_price first (NFT Switch OTC format)
                                if (createTrade.sale_price) {
                                    const salePrice = createTrade.sale_price;
                                    console.log('✅ Found sale_price in exec:', salePrice.amount, salePrice.denom);
                                    return formatAmount(salePrice.amount, salePrice.denom);
                                }
                                
                                // Check for ask_tokens (alternative format)
                                if (createTrade.ask_tokens && Array.isArray(createTrade.ask_tokens)) {
                                    const askTokens = createTrade.ask_tokens;
                                    if (askTokens.length > 0) {
                                        const firstAsk = askTokens[0];
                                        
                                        if (firstAsk.native) {
                                            console.log('✅ Found native ask token in exec:', firstAsk.native.amount, firstAsk.native.denom);
                                            return formatAmount(firstAsk.native.amount, firstAsk.native.denom);
                                        }
                                        
                                        if (firstAsk.cw20) {
                                            console.log('✅ Found CW20 ask token in exec:', firstAsk.cw20.amount);
                                            return formatAmount(firstAsk.cw20.amount, firstAsk.cw20.address);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log('Error parsing execute_contract msg:', e);
                        }
                    }
                }
            }
        }
        
        // For OTC_COMPLETE: Look for the payment in execute_trade with funds
        if (eventType === 'NFTSWITCH_OTC_COMPLETE') {
            console.log('OTC_COMPLETE: Looking for execute_trade with funds...');
            
            for (const msg of messages) {
                if (msg.msg && msg.msg.execute_contract) {
                    console.log('Found execute_contract message');
                    
                    // Check if there are funds sent with the message
                    if (msg.msg.execute_contract.funds && Array.isArray(msg.msg.execute_contract.funds)) {
                        const funds = msg.msg.execute_contract.funds;
                        console.log('Found funds:', JSON.stringify(funds));
                        
                        if (funds.length > 0) {
                            const payment = funds[0];
                            if (payment.amount && payment.denom) {
                                console.log('✅ Found OTC payment:', payment.amount, payment.denom);
                                return formatAmount(payment.amount, payment.denom);
                            }
                        }
                    }
                    
                    // Also check top-level funds (some formats have it here)
                    if (msg.funds && Array.isArray(msg.funds) && msg.funds.length > 0) {
                        const payment = msg.funds[0];
                        console.log('✅ Found OTC payment in top-level funds:', payment.amount, payment.denom);
                        return formatAmount(payment.amount, payment.denom);
                    }
                }
            }
            
            // Fallback: look in logs for coin_spent/transfer events
            for (const log of logs) {
                for (const event of log.events || []) {
                    if (event.type === 'coin_spent' || event.type === 'transfer') {
                        const amountAttr = event.attributes?.find(a => a.key === 'amount');
                        if (amountAttr && amountAttr.value) {
                            const match = amountAttr.value.match(/^(\d+)(.+)$/);
                            if (match && parseInt(match[1]) > 100000) {
                                console.log('✅ Found OTC payment in logs:', match[1], match[2]);
                                return formatAmount(match[1], match[2]);
                            }
                        }
                    }
                }
            }
            
            // Also check top-level events (txResponse.events)
            if (txResponse.events) {
                console.log('Checking top-level events...');
                for (const event of txResponse.events) {
                    if (event.type === 'coin_spent' || event.type === 'transfer') {
                        const amountAttr = event.attributes?.find(a => a.key === 'amount');
                        if (amountAttr && amountAttr.value) {
                            const match = amountAttr.value.match(/^(\d+)(.+)$/);
                            if (match && parseInt(match[1]) > 100000) {
                                console.log('✅ Found OTC payment in top events:', match[1], match[2]);
                                return formatAmount(match[1], match[2]);
                            }
                        }
                    }
                }
            }
        }
        
        console.log('❌ No OTC listing/payment amount found');
        return null;
    } catch (error) {
        console.error('Error extracting OTC amount:', error);
        return null;
    }
}

// Format token amounts
function formatAmount(amount, denom) {
    try {
        if (!amount) return null;
        
        let numAmount = parseFloat(amount);
        
        // Check if this looks like it's already in LUNA units (not micro units)
        // If the number is small (< 10000), it's likely already in LUNA
        // Micro units for typical NFT prices would be in millions (e.g., 249000000 uluna = 249 LUNA)
        if (numAmount >= 1000000) {
            // Convert from micro units (6 decimals) - this is typical
            numAmount = numAmount / 1000000;
        } else if (numAmount < 1) {
            // Very small number, might need to multiply back
            // This handles cases where something was already divided
            numAmount = numAmount * 1000000;
        }
        // If numAmount is between 1 and 999999, assume it's already in proper LUNA units
        
        // Determine token name
        let tokenName = 'LUNA';
        if (denom) {
            const denomLower = denom.toLowerCase();
            // Check for bLUNA contract address (BBL uses this)
            if (denomLower.includes('terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml')) {
                tokenName = 'bLUNA';
            }
            // Check for specific IBC denoms
            else if (denomLower.includes('ibc/05238e98')) {
                tokenName = 'bLUNA';
            } else if (denomLower.includes('ibc/b3504e092456ba618cc28ac671a71fb08c6ca0fd0c7f1b5c2cca6c28bada')) {
                tokenName = 'ampLUNA';
            } else if (denomLower.includes('ibc/05d')) {
                tokenName = 'ampLUNA';
            } else if (denomLower.includes('bluna')) {
                tokenName = 'bLUNA';
            } else if (denomLower.includes('ampluna')) {
                tokenName = 'ampLUNA';
            } else if (denomLower.includes('uluna')) {
                tokenName = 'LUNA';
            }
        }
        
        return `${numAmount.toFixed(6)} ${tokenName}`;
    } catch (error) {
        console.error('Error formatting amount:', error);
        return null;
    }
}

async function loadNextMonth() {
    // SET FLAG TO PREVENT DATA CLEARING
    isLoadingNextMonth = true;
    
    // Get current year and find what months are selected
    const year = parseInt(document.getElementById('year-selector').value);
    const monthNames = ['', 'january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    // Find the earliest month currently selected (excluding 'current')
    let earliestMonth = null;
    for (const month of selectedMonths) {
        if (month !== 'current') {
            if (earliestMonth === null || month < earliestMonth) {
                earliestMonth = month;
            }
        }
    }
    
    // If only 'current' is selected, start with the current actual month
    if (earliestMonth === null) {
        earliestMonth = new Date().getMonth() + 1; // Current month (1-12)
    }
    
    // Calculate previous month
    let prevMonth = earliestMonth - 1;
    let prevYear = year;
    
    if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = year - 1;
        // Update year selector
        document.getElementById('year-selector').value = prevYear;
    }
    
    const displayName = monthNames[prevMonth].charAt(0).toUpperCase() + monthNames[prevMonth].slice(1);
    const monthKey = `${prevMonth}-${prevYear}`;
    
    console.log(`Loading previous month: ${displayName} ${prevYear}`);
    
    // Check if this month is already loaded
    if (loadedMonthsData.has(monthKey)) {
        showToast(`ℹ️ ${displayName} ${prevYear} is already loaded`);
        isLoadingNextMonth = false;
        return;
    }
    
    // Add the previous month to selectedMonths
    selectedMonths.add(prevMonth);
    
    // Update button styles and count display
    updateMonthButtonStyles();
    
    // Build URL for the previous month
    const monthName = monthNames[prevMonth];
    const url = GITHUB_CONFIG.baseURL.replace('YEAR', prevYear) + `${monthName}-${prevYear}.json`;
    
    try {
        console.log('Fetching:', url);
        updateStatus(`Loading ${displayName} ${prevYear}...`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const jsonData = await response.json();
        
        if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
            const newTxs = jsonData.transactions.map(tx => {
                
                return {
                    height: tx.block_height.toString(),
                    timestamp: tx.timestamp,
                    hash: tx.tx_hash,
                    eventType: tx.event_type,
                    tokenIds: tx.nft.token_ids,
                    nftCount: tx.nft.count,
                    sender: tx.buyer.address || 'N/A',
                    recipient: tx.seller.address || 'N/A',
                    amount: tx.price.formatted,
                    rawAmount: tx.price.raw_amount,
                    denom: tx.price.denom,
                    fees: tx.fees.formatted,
                    // Preserve full reward object if it exists
                    rewards: tx.rewards.exists && tx.rewards.type === 'detailed' ? {
                        type: 'detailed',
                        ampLunaTotal: tx.rewards.ampLunaTotal,
                        ampLunaUser: tx.rewards.ampLunaUser,
                        ampLunaTreasury: tx.rewards.ampLunaTreasury,
                        totalLuna: tx.rewards.totalLuna,
                        validatorCount: tx.rewards.validatorCount,
                        stakingValidator: tx.rewards.stakingValidator,
                        recipient: tx.rewards.recipient,
                        treasuryAddress: tx.rewards.treasuryAddress,
                        formatted: tx.rewards.formatted
                    } : tx.rewards.formatted,
                    rawTx: tx.raw_tx || {},
                    monthBanner: `${displayName} ${prevYear}`, // Add banner metadata
                    monthKey: monthKey // Track which month this belongs to
                };
            });
            
            // Store in month data map
            loadedMonthsData.set(monthKey, newTxs);
            
            // APPEND to existing data - don't clear!
            filteredTransactions.push(...newTxs);
            currentBatch.push(...newTxs);
            
            console.log(`Loaded ${newTxs.length} transactions from ${displayName} ${prevYear}`);
            console.log(`Total transactions now: ${filteredTransactions.length}`);
            
            // Re-render with banners
            renderWithMonthBanners();
            
            showToast(`✅ Loaded ${displayName} ${prevYear} (+${newTxs.length} transactions)`);
            updateStatus(`Showing ${filteredTransactions.length} total transactions`);
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error(`Error loading ${displayName} ${prevYear}:`, error);
        showToast(`⚠️ No data available for ${displayName} ${prevYear}`);
        // Remove the month we tried to add since it failed
        selectedMonths.delete(prevMonth);
        updateMonthButtonStyles();
    } finally {
        // RESET FLAG
        isLoadingNextMonth = false;
    }
}

async function searchByHash() {
    const txHash = document.getElementById('tx-hash').value.trim();
    
    if (!txHash) {
        showToast('Please enter a transaction hash');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    updateStatus(`Searching for transaction ${txHash.substring(0, 10)}...`);

    try {
        console.log('Searching for tx:', txHash);
        
        // Try LCD first
        let lcdUrl = `${CONFIG.LCD_API}/cosmos/tx/v1beta1/txs/${txHash}`;
        console.log('Trying LCD:', lcdUrl);
        
        let response = await fetch(lcdUrl);
        let data;
        
        if (response.ok) {
            data = await response.json();
            console.log('LCD response:', data);
            
            if (data.tx_response) {
                currentBatch = await processLCDTransactions([data.tx_response]);
                currentPage = 0;
                document.getElementById('current-batch').textContent = 'Search';
                filterTransactions('ALL');
                updateStatus('Transaction found via LCD');
                showToast('Transaction found!');
            }
        } else {
            // Try RPC
            console.log('LCD failed, trying RPC...');
            const query = `tx.hash='${txHash}'`;
            const rpcUrl = `${CONFIG.RPC_URL}/tx_search?query=${encodeURIComponent(query)}`;
            console.log('Trying RPC:', rpcUrl);
            
            response = await fetch(rpcUrl);
            data = await response.json();
            console.log('RPC response:', data);
            
            if (data.result && data.result.txs && data.result.txs.length > 0) {
                currentBatch = await processTransactions(data.result.txs);
                currentPage = 0;
                document.getElementById('current-batch').textContent = 'Search';
                filterTransactions('ALL');
                updateStatus('Transaction found via RPC');
                showToast('Transaction found!');
            } else {
                currentBatch = [];
                filterTransactions('ALL');
                updateStatus('Transaction not found');
                showToast('Transaction not found');
            }
        }
    } catch (error) {
        console.error('Error searching transaction:', error);
        updateStatus('Error: ' + error.message);
        showToast('Error: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function processTransactions(txs) {
    const processed = [];
    
    for (const tx of txs) {
        const height = tx.height;
        const txHash = tx.hash;
        
        // Get timestamp
        let timestamp = null;
        if (!transactionCache[height]) {
            timestamp = await getBlockTimestamp(height);
            transactionCache[height] = timestamp;
        } else {
            timestamp = transactionCache[height];
        }

        // Classify event
        const eventType = classifyEvent(tx);
        
        // Extract sender
        const sender = extractSender(tx);
        
        // Extract token IDs
        const tokenIds = extractTokenIds(tx);

        processed.push({
            hash: txHash,
            height: height,
            timestamp: timestamp,
            eventType: eventType,
            sender: sender,
            tokenIds: tokenIds,
            rawTx: tx
        });
    }
    
    return processed.sort((a, b) => b.height - a.height);
}

async function getBlockTimestamp(height) {
    try {
        const response = await fetch(`${CONFIG.RPC_URL}/block?height=${height}`);
        const data = await response.json();
        return data.result.block.header.time;
    } catch (error) {
        console.error(`Error fetching block ${height}:`, error);
        return null;
    }
}

function classifyEvent(tx) {
    try {
        // Check messages
        const txBody = tx.tx?.body;
        if (txBody?.messages) {
            for (const msg of txBody.messages) {
                // Check for break/burn
                if (msg.msg && typeof msg.msg === 'object') {
                    const msgStr = JSON.stringify(msg.msg);
                    if (msgStr.includes('burn') || msgStr.includes('break')) {
                        return 'NFT_BREAK';
                    }
                }
                
                // Check contract addresses
                if (msg.contract) {
                    if (msg.contract === CONFIG.DAODAO_STAKING) {
                        if (msg.msg?.stake || msg.msg?.stake_nft) return 'DAODAO_STAKE';
                        if (msg.msg?.unstake || msg.msg?.unstake_nft) return 'DAODAO_UNSTAKE';
                    }
                    if (msg.contract === CONFIG.ENTERPRISE_TOOL) {
                        // Enterprise is shut down - only unstaking possible
                        if (msg.msg?.unstake || msg.msg?.unstake_nfts || msg.msg?.claim) return 'ENTERPRISE_UNSTAKE';
                    }
                    if (msg.contract === CONFIG.BOOST_PROTOCOL) {
                        if (msg.msg?.buy || msg.msg?.purchase) return 'BOOST_PURCHASE';
                        if (msg.msg?.list || msg.msg?.create_listing) return 'BOOST_LISTING';
                    }
                    if (msg.contract === CONFIG.BBL_MARKETPLACE) {
                        if (msg.msg?.buy || msg.msg?.purchase) return 'BBL_PURCHASE';
                        if (msg.msg?.list || msg.msg?.sell) return 'BBL_LISTING';
                    }
                    if (msg.contract === CONFIG.NFT_SWITCH) {
                        return 'NFT_SWITCH_BATCH';
                    }
                }
            }
        }

        // Check events
        const txResult = tx.tx_result;
        if (txResult?.events) {
            for (const event of txResult.events) {
                const eventType = event.type;
                
                if (eventType === 'wasm') {
                    const attributes = event.attributes || [];
                    for (const attr of attributes) {
                        const key = decodeBase64(attr.key);
                        const value = decodeBase64(attr.value);
                        
                        if (key === 'action') {
                            if (value.includes('transfer')) return 'P2P_TRANSFER';
                            if (value.includes('send')) return 'P2P_TRANSFER';
                            if (value.includes('claim')) return 'REWARD_CLAIM';
                            if (value.includes('stake')) return 'GENERIC_STAKE';
                            if (value.includes('unstake')) return 'GENERIC_UNSTAKE';
                        }
                    }
                }
            }
        }

        return 'UNKNOWN_EVENT';
    } catch (error) {
        console.error('Error classifying event:', error);
        return 'ERROR_CLASSIFYING';
    }
}

function extractSender(tx) {
    try {
        const txBody = tx.tx?.body;
        if (txBody?.messages && txBody.messages.length > 0) {
            return txBody.messages[0].sender || 'Unknown';
        }
        return 'Unknown';
    } catch (error) {
        return 'Unknown';
    }
}

function extractTokenIds(tx) {
    const tokenIds = new Set();
    
    try {
        // Check messages
        const txBody = tx.tx?.body;
        if (txBody?.messages) {
            for (const msg of txBody.messages) {
                if (msg.msg) {
                    const msgStr = JSON.stringify(msg.msg);
                    const tokenIdMatches = msgStr.match(/"token_id"\s*:\s*"(\d+)"/g);
                    if (tokenIdMatches) {
                        tokenIdMatches.forEach(match => {
                            const id = match.match(/"(\d+)"/)[1];
                            tokenIds.add(id);
                        });
                    }
                }
            }
        }

        // Check events
        const txResult = tx.tx_result;
        if (txResult?.events) {
            for (const event of txResult.events) {
                if (event.attributes) {
                    for (const attr of event.attributes) {
                        const key = decodeBase64(attr.key);
                        const value = decodeBase64(attr.value);
                        
                        if (key === 'token_id' && value.match(/^\d+$/)) {
                            tokenIds.add(value);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error extracting token IDs:', error);
    }

    return Array.from(tokenIds);
}

// Filter Transactions
function filterTransactions(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });

    applyFilters();
}

function toggleRewardClaims() {
    showRewards = document.getElementById('show-rewards-toggle').checked;
    applyFilters();
}

function applyFilters() {
    // First apply event type filter
    let filtered = currentBatch;
    
    if (currentFilter !== 'ALL') {
        filtered = filtered.filter(tx => tx.eventType.includes(currentFilter));
    }
    
    // Then apply reward claims visibility
    if (!showRewards) {
        filtered = filtered.filter(tx => !tx.eventType.includes('CLAIM'));
    }
    
    filteredTransactions = filtered;
    renderResults();
}

// Render results with month banners between datasets
function renderWithMonthBanners() {
    const tbody = document.getElementById('results-body');
    const countSpan = document.getElementById('result-count');
    
    // Apply filters
    let displayTransactions = filteredTransactions;
    
    // Filter by event type
    if (!selectedEvents.has('ALL')) {
        displayTransactions = displayTransactions.filter(tx => {
            return Array.from(selectedEvents).some(eventType => {
                if (eventType === 'BOOST_TRANSFER') {
                    return tx.eventType.includes('BOOST') && tx.eventType.includes('TRANSFER');
                }
                if (eventType === 'NFTSWITCH_OTC') {
                    return tx.eventType.includes('NFTSWITCH_OTC');
                }
                return tx.eventType.includes(eventType);
            });
        });
    }
    
    // Filter reward claims
    if (!showRewardClaims) {
        displayTransactions = displayTransactions.filter(tx => !tx.eventType.includes('CLAIM'));
    }
    
    countSpan.textContent = displayTransactions.length;
    
    if (displayTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center text-gray-400 py-8">No transactions match the current filters.</td></tr>';
        return;
    }
    
    // Track last seen month banner to insert banners between datasets
    let lastMonthBanner = null;
    let htmlContent = '';
    
    displayTransactions.forEach(tx => {
        // Insert month banner if this is a new month (skip "Current Month")
        if (tx.monthBanner && tx.monthBanner !== lastMonthBanner && tx.monthBanner !== 'Current Month') {
            htmlContent += `
                <tr class="month-banner-row">
                    <td colspan="12" style="padding: 0;">
                        <div class="month-banner">
                            <div class="month-banner-content">
                                <span class="month-banner-icon">📅</span>
                                <span class="month-banner-text">${tx.monthBanner}</span>
                                <span class="month-banner-arrow">▼</span>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
            lastMonthBanner = tx.monthBanner;
        }
        
        // Add regular transaction row (same logic as renderResults)
        const isClaim = tx.eventType.includes('CLAIM');
        const primaryTokenId = tx.tokenIds[0] || 'N/A';
        const nftCount = tx.tokenIds.length;
        const imageUrl = primaryTokenId !== 'N/A' ? getNFTImage(primaryTokenId) : 'https://via.placeholder.com/60?text=N/A';
        const isBroken = primaryTokenId !== 'N/A' ? isNFTBroken(primaryTokenId) : false;
        const hasMultipleNFTs = nftCount > 1;
        
        htmlContent += `
            <tr class="hover:bg-gray-800 hover:bg-opacity-30 transition-colors">
                <td class="col-nft">
                    ${isClaim ? 
                        `<div class="claim-icon" onclick="showClaimModal('${tx.hash}')" title="Click to view claim details">💰</div>` :
                        primaryTokenId !== 'N/A' ? 
                            `<div class="nft-thumbnail-container">
                                ${isBroken ? '<div class="broken-banner">⚠️ BROKEN</div>' : ''}
                                ${hasMultipleNFTs ? `<div class="nft-count-overlay">+${nftCount}</div>` : ''}
                                <img src="${imageUrl}" alt="NFT ${primaryTokenId}" class="nft-thumbnail" onclick="${hasMultipleNFTs ? `showMultiNFTModal('${tx.hash}')` : `showNFTModal('${primaryTokenId}')`}">
                                <div class="nft-id-overlay ${hasMultipleNFTs ? 'nft-id-overlay-multi' : ''}">#${primaryTokenId}</div>
                            </div>` :
                            '<span class="text-gray-500">N/A</span>'
                    }
                </td>
                <td class="col-hash hide-col-hash">
                    <a href="https://chainsco.pe/terra2/tx/${tx.hash}" target="_blank" class="text-cyan-400 hover:text-cyan-300 font-mono text-sm" title="${tx.hash}">${formatTxHash(tx.hash)}</a>
                </td>
                <td class="col-block">
                    <span class="copyable font-mono text-sm" onclick="copyToClipboard('${tx.height}', 'Block height: ${tx.height}')">${tx.height}</span>
                </td>
                <td class="col-timestamp text-sm" style="cursor: pointer;" onclick='showTimestamp("${tx.timestamp}")' title="Click to see timezone details">${formatTimestampWrapped(tx.timestamp)}</td>
                <td class="col-timeago text-sm text-gray-400">${formatTimeAgo(tx.timestamp)}</td>
                <td class="col-event"><span class="badge ${getEventBadgeClass(tx.eventType)}">${formatEventType(tx.eventType)}</span></td>
                <td class="col-nftcount hide-col-nftcount">
                    <span class="text-cyan-400 font-bold">${tx.nftCount || 0}</span>
                </td>
                <td class="col-price">
                    ${tx.eventType.includes('FAILED') ? 
                        `<span class="text-red-500 font-bold cursor-help" 
                               title="Claim failed. Should be made up on the next rewards claim."
                               style="border-bottom: 1px dotted #ef4444;">
                            FAILED
                         </span>` 
                        : tx.amount ? 
                            (isClaim && tx.rewards && tx.rewards.ampLunaTreasury ? 
                                `<span class="text-yellow-400 font-semibold cursor-help" 
                                       title="User: ${tx.rewards.ampLunaUser} ampLUNA&#10;DAO Take (10%): ${tx.rewards.ampLunaTreasury} ampLUNA&#10;Total: ${tx.rewards.ampLunaTotal} ampLUNA&#10;Click 💰 for details"
                                       style="border-bottom: 1px dotted #fbbf24;">
                                    ${formatAmountDisplay(tx.amount)}
                                 </span>` 
                                : `<span class="text-yellow-400 font-semibold">${formatAmountDisplay(tx.amount)}</span>`)
                            : '<span class="text-gray-500">—</span>'}
                </td>
                <td class="col-fees hide-col-fees">
                    ${tx.fees ? `<span class="text-orange-400 text-xs">${tx.fees}</span>` : '<span class="text-gray-500">—</span>'}
                </td>
                <td class="col-sender">
                    ${formatAddressWithName(tx.sender)}
                </td>
                <td class="col-recipient">
                    ${formatAddressWithName(tx.recipient)}
                </td>
                <td class="col-actions hide-col-actions">
                    <button class="btn btn-secondary text-xs" onclick='showRawData(${JSON.stringify(tx.hash)})'>View Raw</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = htmlContent;
}

function renderResults() {
    const tbody = document.getElementById('results-body');
    const countSpan = document.getElementById('result-count');
    
    // Apply event filters
    let displayTransactions = filteredTransactions;
    
    // Filter by event type
    if (!selectedEvents.has('ALL')) {
        displayTransactions = displayTransactions.filter(tx => {
            return Array.from(selectedEvents).some(eventType => {
                if (eventType === 'BOOST_TRANSFER') {
                    return tx.eventType.includes('BOOST') && tx.eventType.includes('TRANSFER');
                }
                if (eventType === 'NFTSWITCH_OTC') {
                    return tx.eventType.includes('NFTSWITCH_OTC');
                }
                return tx.eventType.includes(eventType);
            });
        });
    }
    
    // Filter reward claims
    if (!showRewardClaims) {
        displayTransactions = displayTransactions.filter(tx => !tx.eventType.includes('CLAIM'));
    }
    
    countSpan.textContent = displayTransactions.length;

    if (displayTransactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-gray-400 py-8">
                    No transactions match the current filters.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = displayTransactions.map(tx => {
        const isClaim = tx.eventType.includes('CLAIM');
        const primaryTokenId = tx.tokenIds[0] || 'N/A';
        const nftCount = tx.tokenIds.length;
        const imageUrl = primaryTokenId !== 'N/A' ? getNFTImage(primaryTokenId) : 'https://via.placeholder.com/60?text=N/A';
        const isBroken = primaryTokenId !== 'N/A' ? isNFTBroken(primaryTokenId) : false;
        const hasMultipleNFTs = nftCount > 1;
        
        return `
            <tr>
                <td class="col-nft">
                    ${isClaim ? 
                        `<div class="claim-icon" onclick="showClaimModal('${tx.hash}')" title="Click to view claim details">
                            💰
                        </div>` :
                        primaryTokenId !== 'N/A' ? 
                            `<div class="nft-thumbnail-container">
                                ${isBroken ? '<div class="broken-banner">⚠️ BROKEN</div>' : ''}
                                ${hasMultipleNFTs ? `<div class="nft-count-overlay">+${nftCount}</div>` : ''}
                                <img src="${imageUrl}" alt="NFT ${primaryTokenId}" class="nft-thumbnail" onclick="${hasMultipleNFTs ? `showMultiNFTModal('${tx.hash}')` : `showNFTModal('${primaryTokenId}')`}">
                                <div class="nft-id-overlay ${hasMultipleNFTs ? 'nft-id-overlay-multi' : ''}">#${primaryTokenId}</div>
                            </div>` :
                            '<span class="text-gray-500">N/A</span>'
                    }
                </td>
                <td class="col-hash hide-col-hash">
                    <a href="https://chainsco.pe/terra2/tx/${tx.hash}" target="_blank" class="text-cyan-400 hover:text-cyan-300 font-mono text-sm" title="${tx.hash}">
                        ${formatTxHash(tx.hash)}
                    </a>
                </td>
                <td class="col-block">
                    <span class="copyable font-mono text-sm" onclick="copyToClipboard('${tx.height}', 'Block height: ${tx.height}')">${tx.height}</span>
                </td>
                <td class="col-timestamp text-sm" style="cursor: pointer;" onclick='showTimestamp("${tx.timestamp}")' title="Click to see timezone details">${formatTimestampWrapped(tx.timestamp)}</td>
                <td class="col-timeago text-sm text-gray-400">${formatTimeAgo(tx.timestamp)}</td>
                <td class="col-event"><span class="badge ${getEventBadgeClass(tx.eventType)}">${formatEventType(tx.eventType)}</span></td>
                <td class="col-nftcount hide-col-nftcount">
                    <span class="text-cyan-400 font-bold">${tx.nftCount || 0}</span>
                </td>
                <td class="col-price">
                    ${tx.eventType.includes('FAILED') ? 
                        `<span class="text-red-500 font-bold cursor-help" 
                               title="Claim failed. Should be made up on the next rewards claim."
                               style="border-bottom: 1px dotted #ef4444;">
                            FAILED
                         </span>` 
                        : tx.amount ? 
                            `<span class="text-yellow-400 font-semibold">${formatAmountDisplay(tx.amount)}</span>` : 
                            '<span class="text-gray-500">—</span>'
                    }
                </td>
                <td class="col-fees hide-col-fees">
                    ${tx.fees ? 
                        `<span class="text-orange-400 text-xs">${tx.fees}</span>` : 
                        '<span class="text-gray-500">—</span>'
                    }
                </td>
                <td class="col-sender">
                    ${formatAddressWithName(tx.sender)}
                </td>
                <td class="col-recipient">
                    ${formatAddressWithName(tx.recipient)}
                </td>
                <td class="col-actions hide-col-actions">
                    <button class="btn btn-secondary text-xs" onclick='showRawData(${JSON.stringify(tx.hash)})'>
                        View Raw
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Export to JSON
// Initialize month selector
function initMonthSelector() {
    const monthGrid = document.getElementById('month-grid');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    
    // Add "Current Month" option first
    const currentBtn = document.createElement('button');
    currentBtn.className = 'month-option';
    currentBtn.dataset.month = 'current';
    currentBtn.innerHTML = '<strong>📅 Current</strong>';
    currentBtn.style.cssText = 'padding: 0.5rem; border: 1px solid rgba(45, 212, 191, 0.5); background: rgba(45, 212, 191, 0.2); border-radius: 6px; cursor: pointer; transition: all 0.2s; color: #2dd4bf; font-weight: 600;';
    currentBtn.onclick = function(e) { handleMonthClick('current', e); };
    currentBtn.ondblclick = function(e) { handleMonthDoubleClick('current', e); };
    monthGrid.appendChild(currentBtn);
    
    // Add month buttons
    monthNames.forEach((month, index) => {
        const monthNum = index + 1;
        const btn = document.createElement('button');
        btn.className = 'month-option';
        btn.dataset.month = monthNum;
        btn.textContent = month.substring(0, 3); // Jan, Feb, etc
        btn.style.cssText = 'padding: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 41, 55, 0.5); border-radius: 6px; cursor: pointer; transition: all 0.2s; color: #9CA3AF;';
        
        btn.onclick = function(e) { handleMonthClick(monthNum, e); };
        btn.ondblclick = function(e) { handleMonthDoubleClick(monthNum, e); };
        
        monthGrid.appendChild(btn);
    });
    
    // Select current month by default
    selectedMonths.add('current');
    updateMonthButtonStyles();
}

// Toggle month selector dropdown
function toggleMonthSelector() {
    const dropdown = document.getElementById('month-selector-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('month-selector-dropdown');
    const btn = document.getElementById('month-selector-btn');
    if (dropdown && btn && dropdown.style.display === 'block' && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        // Auto-load when closing
        dropdown.style.display = 'none';
        loadSelectedMonths();
    }
});

// Handle single click - replace selection
let clickTimer = null;
function handleMonthClick(month, event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Clear any existing timer
    if (clickTimer) {
        clearTimeout(clickTimer);
    }
    
    // Wait to see if this is a double-click
    clickTimer = setTimeout(() => {
        console.log('Single click:', month);
        selectedMonths.clear(); // Clear ALL selections including Current
        selectedMonths.add(month);
        updateMonthButtonStyles();
        clickTimer = null;
    }, 250); // 250ms delay to detect double-click
}

// Handle double click - add to selection
function handleMonthDoubleClick(month, event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Clear the single-click timer
    if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
    }
    
    console.log('Double click:', month);
    
    if (selectedMonths.has(month)) {
        // If already selected, deselect it
        selectedMonths.delete(month);
        // Make sure we always have at least one selected
        if (selectedMonths.size === 0) {
            selectedMonths.add('current');
        }
    } else {
        // Add to selection
        selectedMonths.add(month);
    }
    updateMonthButtonStyles();
}

// Update button styles based on selection
function updateMonthButtonStyles() {
    const buttons = document.querySelectorAll('.month-option');
    buttons.forEach(btn => {
        const month = btn.dataset.month === 'current' ? 'current' : parseInt(btn.dataset.month);
        if (selectedMonths.has(month)) {
            btn.style.background = 'rgba(45, 212, 191, 0.3)';
            btn.style.borderColor = '#2dd4bf';
            btn.style.color = '#2dd4bf';
        } else {
            if (btn.dataset.month === 'current') {
                btn.style.background = 'rgba(45, 212, 191, 0.1)';
                btn.style.borderColor = 'rgba(45, 212, 191, 0.3)';
            } else {
                btn.style.background = 'rgba(31, 41, 55, 0.5)';
                btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                btn.style.color = '#9CA3AF';
            }
        }
    });
    
    // Update count
    document.getElementById('selected-month-count').textContent = selectedMonths.size;
}

// Helper function to update month count display
function updateMonthCountDisplay() {
    document.getElementById('selected-month-count').textContent = selectedMonths.size;
}

// Initialize event filter
function initEventFilter() {
    const eventGrid = document.getElementById('event-grid');
    const eventTypes = [
        { key: 'ALL', label: 'Show All' },
        { key: 'BBL_SALE', label: 'BBL Sale' },
        { key: 'BBL_LISTING', label: 'BBL List' },
        { key: 'BBL_DELIST', label: 'BBL Delist' },
        { key: 'BOOST_SALE', label: 'Boost Sale' },
        { key: 'BOOST_LISTING', label: 'Boost List' },
        { key: 'BOOST_TRANSFER', label: 'Boost Xfer' },
        { key: 'BOOST_STAKE', label: 'Boost Stake' },
        { key: 'DAODAO_STAKE', label: 'DAO Stake' },
        { key: 'DAODAO_UNSTAKE', label: 'DAO Unstake' },
        { key: 'NFTSWITCH_OTC', label: 'OTC Trade' },
        { key: 'ALLIANCE_CLAIM', label: 'Alliance' },
        { key: 'CLAIM_FAILED', label: 'Ally Failed' },
        { key: 'TRANSFER', label: 'Transfer' },
        { key: 'BREAK', label: 'NFT Break' }
    ];
    
    eventTypes.forEach(event => {
        const btn = document.createElement('button');
        btn.className = 'event-option';
        btn.dataset.event = event.key;
        btn.textContent = event.label;
        btn.style.cssText = 'padding: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(31, 41, 55, 0.5); border-radius: 6px; cursor: pointer; transition: all 0.2s; color: #9CA3AF; font-size: 0.75rem;';
        
        if (event.key === 'ALL') {
            btn.style.gridColumn = '1 / -1';
            btn.style.fontWeight = '600';
        }
        
        btn.onclick = function(e) { handleEventClick(event.key, e); };
        btn.ondblclick = function(e) { handleEventDoubleClick(event.key, e); };
        
        eventGrid.appendChild(btn);
    });
    
    // Select "ALL" by default
    selectedEvents.add('ALL');
    updateEventButtonStyles();
}

// Toggle event filter dropdown
function toggleEventFilter() {
    const dropdown = document.getElementById('event-filter-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Toggle reward claims visibility
function toggleRewardClaims() {
    showRewardClaims = !showRewardClaims;
    
    // Update button appearance
    const btn = document.getElementById('rewards-toggle-btn');
    const statusSpan = document.getElementById('rewards-status');
    
    if (showRewardClaims) {
        btn.classList.add('active');
        btn.style.background = 'rgba(45, 212, 191, 0.3)';
        btn.style.borderColor = '#2dd4bf';
        btn.style.color = '#2dd4bf';
        statusSpan.textContent = 'Visible';
        showToast('💰 Showing reward claim transactions');
    } else {
        btn.classList.remove('active');
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
        statusSpan.textContent = 'Hidden';
        showToast('💰 Hiding reward claim transactions');
    }
    
    // Re-render to apply filter
    renderResults();
}

// Close event dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('event-filter-dropdown');
    const btn = document.getElementById('event-filter-btn');
    if (dropdown && btn && dropdown.style.display === 'block' && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        // Auto-apply when closing
        dropdown.style.display = 'none';
        applyEventFilters();
    }
});

// Handle event single click - replace selection
let eventClickTimer = null;
function handleEventClick(eventType, event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (eventClickTimer) {
        clearTimeout(eventClickTimer);
    }
    
    eventClickTimer = setTimeout(() => {
        console.log('Single click event:', eventType);
        selectedEvents.clear();
        selectedEvents.add(eventType);
        updateEventButtonStyles();
        eventClickTimer = null;
    }, 250);
}

// Handle event double click - add to selection
function handleEventDoubleClick(eventType, event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (eventClickTimer) {
        clearTimeout(eventClickTimer);
        eventClickTimer = null;
    }
    
    console.log('Double click event:', eventType);
    
    if (selectedEvents.has(eventType)) {
        selectedEvents.delete(eventType);
        if (selectedEvents.size === 0) {
            selectedEvents.add('ALL');
        }
    } else {
        // If adding a specific event, remove ALL
        if (eventType !== 'ALL' && selectedEvents.has('ALL')) {
            selectedEvents.delete('ALL');
        }
        // If adding ALL, clear everything else
        if (eventType === 'ALL') {
            selectedEvents.clear();
        }
        selectedEvents.add(eventType);
    }
    updateEventButtonStyles();
}

// Update event button styles
function updateEventButtonStyles() {
    const buttons = document.querySelectorAll('.event-option');
    buttons.forEach(btn => {
        const eventType = btn.dataset.event;
        if (selectedEvents.has(eventType)) {
            btn.style.background = 'rgba(45, 212, 191, 0.3)';
            btn.style.borderColor = '#2dd4bf';
            btn.style.color = '#2dd4bf';
        } else {
            btn.style.background = 'rgba(31, 41, 55, 0.5)';
            btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            btn.style.color = '#9CA3AF';
        }
    });
    
    // Update count display
    const count = selectedEvents.has('ALL') ? 'All' : selectedEvents.size;
    document.getElementById('selected-event-count').textContent = count;
}

// Apply event filters
function applyEventFilters() {
    console.log('Applying event filters:', Array.from(selectedEvents));
    renderResults();
    showToast(`🏷️ Filtered by: ${Array.from(selectedEvents).join(', ')}`);
}

// Load selected months
async function loadSelectedMonths() {
    console.log('Loading months:', Array.from(selectedMonths));
    
    if (selectedMonths.size === 0) {
        showToast('⚠️ No months selected');
        showErrorInTable('No Months Selected', 'Please select at least one month to load transactions.');
        return;
    }
    
    // Close dropdown
    document.getElementById('month-selector-dropdown').style.display = 'none';
    
    // Clear existing data ONLY if not loading next month
    if (!isLoadingNextMonth) {
        console.log('🗑️ Clearing existing data - isLoadingNextMonth:', isLoadingNextMonth);
        console.log('   Current filteredTransactions count:', filteredTransactions.length);
        filteredTransactions = [];
        loadedMonthsData.clear();
        console.log('   After clear:', filteredTransactions.length);
        
        // Show loading spinner
        showLoadingInTable('Loading transactions...');
    } else {
        console.log('⚠️ NOT clearing data - isLoadingNextMonth:', isLoadingNextMonth);
    }
    
    const year = parseInt(document.getElementById('year-selector').value);
    const monthNames = ['', 'january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    updateStatus(`Loading ${selectedMonths.size} month(s)...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const month of selectedMonths) {
        let url;
        let displayName;
        
        if (month === 'current') {
            url = GITHUB_CONFIG.baseURL.replace('YEAR', year) + 'current-partial.json';
            displayName = 'Current Month';
        } else {
            const monthName = monthNames[month];
            url = GITHUB_CONFIG.baseURL.replace('YEAR', year) + `${monthName}-${year}.json`;
            displayName = monthNames[month].charAt(0).toUpperCase() + monthNames[month].slice(1);
        }
        
        // Add cache-busting parameter to force fresh load
        url += `?v=${Date.now()}`;
        
        try {
            console.log('Fetching:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const jsonData = await response.json();
            
            if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
                const newTxs = jsonData.transactions.map(tx => {
                    return {
                        height: tx.block_height.toString(),
                        timestamp: tx.timestamp,
                        hash: tx.tx_hash,
                        eventType: tx.event_type,
                        tokenIds: tx.nft.token_ids,
                        nftCount: tx.nft.count,
                        sender: tx.buyer.address || 'N/A',
                        recipient: tx.seller.address || 'N/A',
                        amount: tx.price.formatted,
                        rawAmount: tx.price.raw_amount,
                        denom: tx.price.denom,
                        fees: tx.fees.formatted,
                        // Preserve full reward object if it exists
                        rewards: tx.rewards.exists && tx.rewards.type === 'detailed' ? {
                            type: 'detailed',
                            ampLunaTotal: tx.rewards.ampLunaTotal,
                            ampLunaUser: tx.rewards.ampLunaUser,
                            ampLunaTreasury: tx.rewards.ampLunaTreasury,
                            totalLuna: tx.rewards.totalLuna,
                            validatorCount: tx.rewards.validatorCount,
                            stakingValidator: tx.rewards.stakingValidator,
                            recipient: tx.rewards.recipient,
                            treasuryAddress: tx.rewards.treasuryAddress,
                            formatted: tx.rewards.formatted
                        } : tx.rewards.formatted,
                        monthBanner: month === 'current' ? 'Current Month' : `${displayName} ${year}`
                    };
                });
                
                filteredTransactions.push(...newTxs);
                console.log(`Loaded ${newTxs.length} transactions from ${displayName}`);
                successCount++;
            } else {
                throw new Error('Invalid data format - missing transactions array');
            }
        } catch (error) {
            console.error(`Error loading ${displayName}:`, error);
            errorCount++;
            showToast(`⚠️ Could not load ${displayName}: ${error.message}`);
        }
    }
    
    // Check if we loaded any data
    if (filteredTransactions.length === 0) {
        if (errorCount > 0) {
            showErrorInTable(
                'Failed to Load Data', 
                `Could not load any month data. Check console for details or verify that data files exist on GitHub.`
            );
        } else {
            showErrorInTable(
                'No Transactions Found',
                'The selected months contain no transaction data.'
            );
        }
        updateStatus('❌ Failed to load transaction data');
        return;
    }
    
    // Sort by block height descending
    filteredTransactions.sort((a, b) => parseInt(b.height) - parseInt(a.height));
    
    // Render results with banners if we have monthBanner data
    const hasMonthBanners = filteredTransactions.some(tx => tx.monthBanner);
    if (hasMonthBanners) {
        renderWithMonthBanners();
    } else {
        renderResults();
    }
    
    const monthList = Array.from(selectedMonths).map(m => 
        m === 'current' ? 'Current' : monthNames[m]
    ).join(', ');
    
    updateStatus(`✅ Loaded ${filteredTransactions.length} transactions from: ${monthList}`);
    showToast(`📂 Loaded ${selectedMonths.size} month(s) (${successCount} successful, ${errorCount} failed)`);
}

// Show loading spinner in table
function showLoadingInTable(message = 'Loading...') {
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center py-8">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">${message}</div>
                </div>
            </td>
        </tr>
    `;
}

// Show error message in table
function showErrorInTable(title, details) {
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = `
        <tr>
            <td colspan="12" class="text-center py-8">
                <div class="error-container">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">${title}</div>
                    <div class="error-details">${details}</div>
                </div>
            </td>
        </tr>
    `;
}


// Load current month's partial data
function loadCurrentMonth() {
    console.log('Loading current month partial data');
    loadMonthFromGitHub(true); // true = load current-partial.json
}

// Reset to defaults
function resetToDefaults() {
    console.log('Resetting to defaults');
    
    // Clear all data
    filteredTransactions = [];
    existingMonthData = null;
    loadedFromGitHub = false;
    
    // Reset year dropdown to current year
    const now = new Date();
    currentYear = now.getFullYear();
    document.getElementById('year-selector').value = currentYear;
    
    // Reset month selection to current only
    selectedMonths.clear();
    selectedMonths.add('current');
    updateMonthButtonStyles();
    
    // Clear table
    renderResults();
    
    // Hide update button
    document.getElementById('update-json-btn').style.display = 'none';
    
    // Clear block input
    document.getElementById('block-heights-input').value = '';
    
    // Reset status
    updateStatus('Reset complete. Ready to load data.');
    showToast('🔄 Reset to defaults');
    
    // Auto-load current month if GitHub enabled
    if (GITHUB_CONFIG.enabled) {
        setTimeout(() => {
            loadSelectedMonths();
        }, 500);
    }
}

// Load month data from GitHub
async function loadMonthFromGitHub(loadPartial = false) {
    console.log('loadMonthFromGitHub called with loadPartial:', loadPartial);
    console.log('GITHUB_CONFIG:', GITHUB_CONFIG);
    
    if (!GITHUB_CONFIG.enabled) {
        console.warn('GitHub loading disabled');
        showToast('⚠️ GitHub loading not enabled. Edit GITHUB_CONFIG at top of file.');
        return;
    }
    
    let url;
    let displayName;
    
    if (loadPartial) {
        // Load the current partial file
        const yearSuffix = new Date().getFullYear();
        url = GITHUB_CONFIG.baseURL.replace('YEAR', yearSuffix) + 'current-partial.json';
        displayName = 'Current Month (Partial)';
        console.log('Loading partial file from:', url);
    } else {
        // Load specific month from dropdown
        const month = parseInt(document.getElementById('month-selector').value);
        const year = parseInt(document.getElementById('year-selector').value);
        
        const monthNames = ['', 'january', 'february', 'march', 'april', 'may', 'june', 
                           'july', 'august', 'september', 'october', 'november', 'december'];
        const monthName = monthNames[month];
        
        const yearSuffix = year;
        url = GITHUB_CONFIG.baseURL.replace('YEAR', yearSuffix) + `${monthName}-${year}.json`;
        displayName = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
        console.log('Loading month file from:', url);
    }
    
    updateStatus(`⏳ Loading ${displayName} from GitHub...`);
    
    try {
        console.log('Fetching:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('Loaded JSON data:', jsonData);
        existingMonthData = jsonData;
        loadedFromGitHub = true;
        
        // Load transactions into table
        if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
            console.log('Processing', jsonData.transactions.length, 'transactions');
            filteredTransactions = jsonData.transactions.map(tx => ({
                height: tx.block_height.toString(),
                timestamp: tx.timestamp,
                hash: tx.tx_hash,
                eventType: tx.event_type,
                tokenIds: tx.nft.token_ids,
                nftCount: tx.nft.count,
                sender: tx.buyer.address || 'N/A',
                recipient: tx.seller.address || 'N/A',
                amount: tx.price.formatted,
                rawAmount: tx.price.raw_amount,
                denom: tx.price.denom,
                fees: tx.fees.formatted,
                // Preserve full reward object if it exists
                rewards: tx.rewards.exists && tx.rewards.type === 'detailed' ? {
                    type: 'detailed',
                    ampLunaTotal: tx.rewards.ampLunaTotal,
                    ampLunaUser: tx.rewards.ampLunaUser,
                    ampLunaTreasury: tx.rewards.ampLunaTreasury,
                    totalLuna: tx.rewards.totalLuna,
                    validatorCount: tx.rewards.validatorCount,
                    stakingValidator: tx.rewards.stakingValidator,
                    recipient: tx.rewards.recipient,
                    treasuryAddress: tx.rewards.treasuryAddress,
                    formatted: tx.rewards.formatted
                } : tx.rewards.formatted
            }));
            
            console.log('Rendering results...');
            renderResults();
            
            const metadata = jsonData.metadata || {};
            const isComplete = metadata.is_complete !== false;
            
            updateStatus(`✅ Loaded ${filteredTransactions.length} transactions from ${displayName} ${!isComplete ? '(INCOMPLETE - can update)' : '(COMPLETE)'}`);
            showToast(`📂 Loaded ${displayName} from GitHub ${!isComplete ? '⚠️' : '✅'}`);
            
            // Show Update button if incomplete
            if (!isComplete) {
                document.getElementById('update-json-btn').style.display = 'inline-block';
            } else {
                document.getElementById('update-json-btn').style.display = 'none';
            }
        } else {
            throw new Error('Invalid JSON format - missing transactions array');
        }
    } catch (error) {
        console.error('GitHub load error:', error);
        updateStatus(`❌ Could not load ${displayName} from GitHub: ${error.message}`);
        showToast(`❌ Failed to load from GitHub: ${error.message}`);
        
        // Clear table
        filteredTransactions = [];
        renderResults();
    }
}

// Load existing JSON file
function loadExistingJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            existingMonthData = jsonData;
            
            // Load transactions into the table
            if (jsonData.transactions && Array.isArray(jsonData.transactions)) {
                // Convert back to filteredTransactions format
                filteredTransactions = jsonData.transactions.map(tx => ({
                    height: tx.block_height.toString(),
                    timestamp: tx.timestamp,
                    hash: tx.tx_hash,
                    eventType: tx.event_type,
                    tokenIds: tx.nft.token_ids,
                    nftCount: tx.nft.count,
                    sender: tx.buyer.address || 'N/A',
                    recipient: tx.seller.address || 'N/A',
                    amount: tx.price.formatted,
                    rawAmount: tx.price.raw_amount,
                    denom: tx.price.denom,
                    fees: tx.fees.formatted,
                    // Preserve full reward object if it exists
                    rewards: tx.rewards.exists && tx.rewards.type === 'detailed' ? {
                        type: 'detailed',
                        ampLunaTotal: tx.rewards.ampLunaTotal,
                        ampLunaUser: tx.rewards.ampLunaUser,
                        ampLunaTreasury: tx.rewards.ampLunaTreasury,
                        totalLuna: tx.rewards.totalLuna,
                        validatorCount: tx.rewards.validatorCount,
                        stakingValidator: tx.rewards.stakingValidator,
                        recipient: tx.rewards.recipient,
                        treasuryAddress: tx.rewards.treasuryAddress,
                        formatted: tx.rewards.formatted
                    } : tx.rewards.formatted
                }));
                
                renderResults();
                
                const metadata = jsonData.metadata || {};
                const monthName = metadata.month || 'Unknown';
                const year = metadata.year || 'Unknown';
                const isComplete = metadata.is_complete !== false;
                
                showToast(`📂 Loaded ${filteredTransactions.length} transactions from ${monthName} ${year} ${!isComplete ? '(INCOMPLETE)' : ''}`);
                
                // Show the Update button
                document.getElementById('update-json-btn').style.display = 'inline-block';
            } else {
                showToast('⚠️ Invalid JSON format');
            }
        } catch (error) {
            showToast('❌ Error loading JSON: ' + error.message);
            console.error('JSON load error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Toggle Transaction Tools visibility
function toggleTransactionTools() {
    const content = document.getElementById('transaction-tools-content');
    const icon = document.getElementById('tools-toggle-icon');
    const isVisible = content.style.display !== 'none';
    
    content.style.display = isVisible ? 'none' : 'block';
    icon.textContent = isVisible ? '▼' : '▲';
}

// Toggle image overlays visibility
function toggleImages() {
    imagesVisible = !imagesVisible;
    const overlays = document.querySelectorAll('.nft-id-overlay, .nft-count-overlay, .broken-banner');
    const btn = document.getElementById('toggle-images-btn');
    
    overlays.forEach(overlay => {
        overlay.style.display = imagesVisible ? 'block' : 'none';
    });
    
    btn.textContent = imagesVisible ? '🖼️ Hide Overlays' : '🖼️ Show Overlays';
    showToast(imagesVisible ? '🖼️ Overlays shown' : '🙈 Overlays hidden');
}

// Update and merge JSON with new blocks
async function updateAndMergeJSON() {
    if (!existingMonthData) {
        showToast('⚠️ No existing data loaded');
        return;
    }
    
    if (filteredTransactions.length === 0) {
        showToast('⚠️ No new transactions to add');
        return;
    }
    
    // Get existing transaction hashes for deduplication
    const existingHashes = new Set(
        existingMonthData.transactions.map(tx => tx.tx_hash)
    );
    
    // Find truly new transactions
    const newTransactions = filteredTransactions.filter(tx => 
        !existingHashes.has(tx.hash)
    );
    
    if (newTransactions.length === 0) {
        showToast('ℹ️ No new transactions found - all already exist in loaded data');
        return;
    }
    
    showToast(`🔄 Merging ${newTransactions.length} new transactions...`);
    
    // Convert new transactions to export format
    const newExportFormat = newTransactions.map(tx => ({
        block_height: parseInt(tx.height),
        timestamp: tx.timestamp,
        tx_hash: tx.hash,
        event_type: tx.eventType,
        nft: {
            token_ids: tx.tokenIds || [],
            count: tx.nftCount || 0
        },
        seller: {
            exists: !!tx.recipient && tx.recipient !== 'N/A',
            address: tx.recipient || null
        },
        buyer: {
            exists: !!tx.sender && tx.sender !== 'N/A',
            address: tx.sender || null
        },
        price: {
            exists: !!tx.amount,
            formatted: tx.amount || null,
            raw_amount: tx.rawAmount || null,
            denom: tx.denom || null
        },
        fees: {
            exists: !!tx.fees,
            formatted: tx.fees || null
        },
        rewards: {
            exists: !!tx.rewards,
            formatted: tx.rewards || null
        }
    }));
    
    // Merge with existing
    const mergedTransactions = [...existingMonthData.transactions, ...newExportFormat];
    
    // Sort by block height (descending)
    mergedTransactions.sort((a, b) => b.block_height - a.block_height);
    
    // Update metadata
    const dates = mergedTransactions.map(tx => new Date(tx.timestamp));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    
    // Check if month is now complete
    const firstDay = oldestDate.getDate();
    const lastDay = newestDate.getDate();
    const lastDayOfMonth = new Date(newestDate.getFullYear(), newestDate.getMonth() + 1, 0).getDate();
    const isComplete = firstDay === 1 && lastDay === lastDayOfMonth;
    
    const updatedData = {
        metadata: {
            ...existingMonthData.metadata,
            generated_at: new Date().toISOString(),
            total_transactions: mergedTransactions.length,
            date_range: {
                oldest: oldestDate.toISOString(),
                newest: newestDate.toISOString()
            },
            block_range: {
                min: Math.min(...mergedTransactions.map(tx => tx.block_height)),
                max: Math.max(...mergedTransactions.map(tx => tx.block_height))
            },
            is_complete: isComplete,
            last_updated: new Date().toISOString(),
            event_types: {}
        },
        transactions: mergedTransactions
    };
    
    // Recalculate event types
    mergedTransactions.forEach(tx => {
        const eventType = tx.event_type;
        updatedData.metadata.event_types[eventType] = (updatedData.metadata.event_types[eventType] || 0) + 1;
    });
    
    // Export
    const dataStr = JSON.stringify(updatedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const monthName = updatedData.metadata.month.toLowerCase();
    const year = updatedData.metadata.year;
    const filename = `${monthName}-${year}.json`;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast(`✅ Updated ${filename} - Added ${newTransactions.length} new transactions (Total: ${mergedTransactions.length}) ${isComplete ? '🎉 COMPLETE!' : '⚠️ Still incomplete'}`);
    
    // Also copy to clipboard
    navigator.clipboard.writeText(dataStr).then(() => {
        showToast('📋 Updated JSON also copied to clipboard!', 'info');
    }).catch(err => {
        console.log('Could not copy to clipboard:', err);
    });
    
    // Update the existing data reference
    existingMonthData = updatedData;
}

// Enhanced function to extract detailed price info with token metadata
function extractDetailedPrice(tx) {
    try {
        // Parse existing amount string if available
        if (tx.amount) {
            const match = tx.amount.match(/^([\d.]+)\s+(.+)$/);
            if (match) {
                const [, amount, symbol] = match;
                
                // Look up token info
                let tokenInfo = null;
                if (addressBook.tokens) {
                    for (const [address, tokenData] of Object.entries(addressBook.tokens)) {
                        if (tokenData.symbol === symbol) {
                            tokenInfo = tokenData;
                            break;
                        }
                    }
                }
                
                return {
                    exists: true,
                    amount: amount,
                    token_symbol: symbol,
                    token_name: tokenInfo?.name || symbol,
                    token_address: tokenInfo?.address || tx.denom || null,
                    decimals: tokenInfo?.decimals || 6,
                    raw_amount: tx.rawAmount || null,
                    formatted: tx.amount
                };
            }
        }
        
        return {
            exists: false,
            amount: null,
            token_symbol: null,
            token_name: null,
            token_address: null,
            decimals: null,
            raw_amount: null,
            formatted: null
        };
    } catch (error) {
        console.error('Error extracting detailed price:', error);
        return null;
    }
}

// Export Summary JSON with comprehensive data
function exportSummaryJSON() {
    if (filteredTransactions.length === 0) {
        showToast('No data to export');
        return;
    }

    const allDates = filteredTransactions.map(tx => new Date(tx.timestamp));
    const oldestDate = new Date(Math.min(...allDates));
    const newestDate = new Date(Math.max(...allDates));
    
    const oldestMonth = oldestDate.getMonth() + 1;
    const oldestYear = oldestDate.getFullYear();
    const newestMonth = newestDate.getMonth() + 1;
    const newestYear = newestDate.getFullYear();
    
    const transactionsByMonth = {};
    
    filteredTransactions.forEach(tx => {
        const date = new Date(tx.timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, '0')}`;
        
        if (!transactionsByMonth[key]) {
            transactionsByMonth[key] = [];
        }
        transactionsByMonth[key].push(tx);
    });
    
    const exportedFiles = [];
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const sortedMonthKeys = Object.keys(transactionsByMonth).sort();
    
    sortedMonthKeys.forEach((monthKey) => {
        const txs = transactionsByMonth[monthKey];
        const [year, monthNum] = monthKey.split('-').map(Number);
        const monthName = monthNames[monthNum];
        
        if (window.monthsWithNewData && window.monthsWithNewData.size > 0) {
            if (!window.monthsWithNewData.has(monthKey)) {
                console.log(`⏭️ Skipping ${monthName} ${year} - no new transactions`);
                return;
            }
        }
        
        const isOldestMonth = (monthNum === oldestMonth && year === oldestYear);
        if (isOldestMonth) {
            console.log(`Skipping ${monthName} ${year} - oldest month`);
            return;
        }
        
        const isNewestMonth = (monthNum === newestMonth && year === newestYear);
        const isComplete = !isNewestMonth;
        
        const dates = txs.map(tx => new Date(tx.timestamp));
        const monthOldest = new Date(Math.min(...dates));
        const monthNewest = new Date(Math.max(...dates));
        
        // Create enhanced export data
        const exportData = {
            metadata: {
                version: "2.0.0",
                generated_at: new Date().toISOString(),
                month: monthName,
                month_number: monthNum,
                year: year,
                is_complete: isComplete,
                date_range: {
                    oldest: monthOldest.toISOString(),
                    newest: monthNewest.toISOString()
                },
                total_transactions: txs.length,
                block_range: {
                    min: Math.min(...txs.map(tx => parseInt(tx.height))),
                    max: Math.max(...txs.map(tx => parseInt(tx.height)))
                },
                event_types: {},
                data_source: "Alliance DAO TX Explorer",
                explorer_version: "4.0"
            },
            transactions: txs.map(tx => {
                // Get human-readable info
                const buyerInfo = tx.sender ? lookupAddress(tx.sender) : null;
                const sellerInfo = tx.recipient ? lookupAddress(tx.recipient) : null;
                const validatorInfo = tx.rewards?.stakingValidator ? 
                    lookupAddress(tx.rewards.stakingValidator) : null;
                
                // Get detailed price info
                const priceDetails = extractDetailedPrice(tx);
                
                return {
                    block_height: parseInt(tx.height),
                    timestamp: tx.timestamp,
                    tx_hash: tx.hash,
                    event_type: tx.eventType,
                    nft: {
                        token_ids: tx.tokenIds || [],
                        count: tx.nftCount || 0
                    },
                    seller: {
                        exists: !!tx.recipient && tx.recipient !== 'N/A',
                        address: tx.recipient || null,
                        handle: sellerInfo?.handle || null,
                        name: sellerInfo?.name || null,
                        type: sellerInfo?.type || null
                    },
                    buyer: {
                        exists: !!tx.sender && tx.sender !== 'N/A',
                        address: tx.sender || null,
                        handle: buyerInfo?.handle || null,
                        name: buyerInfo?.name || null,
                        type: buyerInfo?.type || null
                    },
                    price: priceDetails,
                    fees: {
                        exists: !!tx.fees,
                        formatted: tx.fees || null
                    },
                    rewards: tx.rewards && typeof tx.rewards === 'object' ? {
                        exists: true,
                        type: tx.rewards.type || 'detailed',
                        ampLunaTotal: tx.rewards.ampLunaTotal || null,
                        ampLunaUser: tx.rewards.ampLunaUser || null,
                        ampLunaTreasury: tx.rewards.ampLunaTreasury || null,
                        totalLuna: tx.rewards.totalLuna || null,
                        validatorCount: tx.rewards.validatorCount || 0,
                        stakingValidator: tx.rewards.stakingValidator || null,
                        stakingValidatorName: validatorInfo?.name || null,
                        recipient: tx.rewards.recipient || null,
                        recipientHandle: buyerInfo?.handle || null,
                        treasuryAddress: tx.rewards.treasuryAddress || null,
                        formatted: tx.rewards.formatted || null
                    } : {
                        exists: !!tx.rewards,
                        formatted: tx.rewards || null
                    }
                };
            })
        };
        
        exportData.transactions.sort((a, b) => b.block_height - a.block_height);
        
        // Count event types
        exportData.transactions.forEach(tx => {
            const eventType = tx.event_type;
            exportData.metadata.event_types[eventType] = 
                (exportData.metadata.event_types[eventType] || 0) + 1;
        });
        
        // Determine filename
        let filename = isNewestMonth ? 'current-partial.json' : 
            `${monthName.toLowerCase()}-${year}.json`;
        
        // Create and download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        exportedFiles.push({
            filename,
            month: monthName,
            year,
            count: txs.length,
            isComplete
        });
    });
    
    if (exportedFiles.length === 0) {
        showToast('⚠️ No complete months found');
        return;
    }
    
    const summary = exportedFiles.map(f => 
        `${f.filename} - ${f.month} ${f.year} (${f.count} txs) ${f.isComplete ? '✅' : '⚠️'}`
    ).join('\n');
    
    showToast(`✅ Exported ${exportedFiles.length} summary file(s):\n${summary}`);
    window.monthsWithNewData = null;
}

// Export Raw Data JSON (separate files for raw transaction data)
function exportRawDataJSON() {
    if (filteredTransactions.length === 0) {
        showToast('No data to export');
        return;
    }
    
    // Check if we have raw data
    const txsWithRawData = filteredTransactions.filter(tx => 
        tx.rawTx && Object.keys(tx.rawTx).length > 0
    );
    
    if (txsWithRawData.length === 0) {
        showToast('⚠️ No raw transaction data available. Use Auto-Scan to capture raw data.');
        return;
    }
    
    const allDates = filteredTransactions.map(tx => new Date(tx.timestamp));
    const oldestDate = new Date(Math.min(...allDates));
    const newestDate = new Date(Math.max(...allDates));
    
    const oldestMonth = oldestDate.getMonth() + 1;
    const oldestYear = oldestDate.getFullYear();
    const newestMonth = newestDate.getMonth() + 1;
    const newestYear = newestDate.getFullYear();
    
    // Group by month
    const transactionsByMonth = {};
    
    filteredTransactions.forEach(tx => {
        const date = new Date(tx.timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, '0')}`;
        
        if (!transactionsByMonth[key]) {
            transactionsByMonth[key] = [];
        }
        transactionsByMonth[key].push(tx);
    });
    
    const exportedFiles = [];
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const sortedMonthKeys = Object.keys(transactionsByMonth).sort();
    
    sortedMonthKeys.forEach((monthKey) => {
        const txs = transactionsByMonth[monthKey];
        const [year, monthNum] = monthKey.split('-').map(Number);
        const monthName = monthNames[monthNum];
        
        // Filter to only txs with raw data
        const txsWithRaw = txs.filter(tx => tx.rawTx && Object.keys(tx.rawTx).length > 0);
        
        if (txsWithRaw.length === 0) {
            console.log(`⏭️ Skipping ${monthName} ${year} - no raw data`);
            return;
        }
        
        const isOldestMonth = (monthNum === oldestMonth && year === oldestYear);
        if (isOldestMonth) {
            console.log(`Skipping ${monthName} ${year} - oldest month`);
            return;
        }
        
        const isNewestMonth = (monthNum === newestMonth && year === newestYear);
        
        // Create raw data mapping: { tx_hash: raw_tx }
        const rawDataMap = {};
        txsWithRaw.forEach(tx => {
            rawDataMap[tx.hash] = tx.rawTx;
        });
        
        // Determine filename
        let filename = isNewestMonth ? 'current-partial-raw.json' : 
            `${monthName.toLowerCase()}-${year}-raw.json`;
        
        // Create and download
        const dataStr = JSON.stringify(rawDataMap, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        exportedFiles.push({
            filename,
            month: monthName,
            year,
            count: txsWithRaw.length
        });
    });
    
    if (exportedFiles.length === 0) {
        showToast('⚠️ No raw data to export');
        return;
    }
    
    const summary = exportedFiles.map(f => 
        `${f.filename} - ${f.month} ${f.year} (${f.count} txs with raw data)`
    ).join('\n');
    
    showToast(`✅ Exported ${exportedFiles.length} raw data file(s):\n${summary}`);
}

function exportToJSON() {
    if (filteredTransactions.length === 0) {
        showToast('No data to export');
        return;
    }

    // Get overall date range
    const allDates = filteredTransactions.map(tx => new Date(tx.timestamp));
    const oldestDate = new Date(Math.min(...allDates));
    const newestDate = new Date(Math.max(...allDates));
    
    const oldestMonth = oldestDate.getMonth() + 1; // 1-12
    const oldestYear = oldestDate.getFullYear();
    const newestMonth = newestDate.getMonth() + 1;
    const newestYear = newestDate.getFullYear();
    
    // Group transactions by month
    const transactionsByMonth = {};
    
    filteredTransactions.forEach(tx => {
        const date = new Date(tx.timestamp);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 1-12
        const key = `${year}-${String(month).padStart(2, '0')}`;
        
        if (!transactionsByMonth[key]) {
            transactionsByMonth[key] = [];
        }
        transactionsByMonth[key].push(tx);
    });
    
    const exportedFiles = [];
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Determine which months to export
    // Rule: If we have data from month X, then month X+1 is complete (if it exists in our data)
    const sortedMonthKeys = Object.keys(transactionsByMonth).sort();
    
    sortedMonthKeys.forEach((monthKey, index) => {
        const txs = transactionsByMonth[monthKey];
        const [year, monthNum] = monthKey.split('-').map(Number);
        const monthName = monthNames[monthNum];
        
        // If we have tracked months with new data, only export those
        if (window.monthsWithNewData && window.monthsWithNewData.size > 0) {
            if (!window.monthsWithNewData.has(monthKey)) {
                console.log(`⏭️ Skipping ${monthName} ${year} - no new transactions in this month`);
                return; // Skip this month - no new data
            } else {
                console.log(`📦 Exporting ${monthName} ${year} - has new transactions`);
            }
        }
        
        // Check if this is the oldest month (skip it - only used for validation)
        const isOldestMonth = (monthNum === oldestMonth && year === oldestYear);
        
        if (isOldestMonth) {
            console.log(`Skipping ${monthName} ${year} - oldest month, used only for validation`);
            return; // Skip oldest month
        }
        
        // Check if this is the newest month (will be partial)
        const isNewestMonth = (monthNum === newestMonth && year === newestYear);
        
        // This month is complete because we have data from the previous month
        const isComplete = !isNewestMonth;
        
        // Get date range for this month's transactions
        const dates = txs.map(tx => new Date(tx.timestamp));
        const monthOldest = new Date(Math.min(...dates));
        const monthNewest = new Date(Math.max(...dates));
        
        // Create export data
        const exportData = {
            metadata: {
                version: "1.0.0",
                generated_at: new Date().toISOString(),
                month: monthName,
                month_number: monthNum,
                year: year,
                is_complete: isComplete,
                date_range: {
                    oldest: monthOldest.toISOString(),
                    newest: monthNewest.toISOString()
                },
                total_transactions: txs.length,
                block_range: {
                    min: Math.min(...txs.map(tx => parseInt(tx.height))),
                    max: Math.max(...txs.map(tx => parseInt(tx.height)))
                },
                event_types: {}
            },
            transactions: txs.map(tx => ({
                block_height: parseInt(tx.height),
                timestamp: tx.timestamp,
                tx_hash: tx.hash,
                event_type: tx.eventType,
                nft: {
                    token_ids: tx.tokenIds || [],
                    count: tx.nftCount || 0
                },
                seller: {
                    exists: !!tx.recipient && tx.recipient !== 'N/A',
                    address: tx.recipient || null
                },
                buyer: {
                    exists: !!tx.sender && tx.sender !== 'N/A',
                    address: tx.sender || null
                },
                price: {
                    exists: !!tx.amount,
                    formatted: tx.amount || null,
                    raw_amount: tx.rawAmount || null,
                    denom: tx.denom || null
                },
                fees: {
                    exists: !!tx.fees,
                    formatted: tx.fees || null
                },
                rewards: tx.rewards && typeof tx.rewards === 'object' ? {
                    exists: true,
                    type: tx.rewards.type || 'detailed',
                    ampLunaTotal: tx.rewards.ampLunaTotal || null,
                    ampLunaUser: tx.rewards.ampLunaUser || null,
                    ampLunaTreasury: tx.rewards.ampLunaTreasury || null,
                    totalLuna: tx.rewards.totalLuna || null,
                    validatorCount: tx.rewards.validatorCount || 0,
                    stakingValidator: tx.rewards.stakingValidator || null,
                    recipient: tx.rewards.recipient || null,
                    treasuryAddress: tx.rewards.treasuryAddress || null,
                    formatted: tx.rewards.formatted || null
                } : {
                    exists: !!tx.rewards,
                    formatted: tx.rewards || null
                }
            }))
        };
        
        // Sort transactions by block height descending
        exportData.transactions.sort((a, b) => b.block_height - a.block_height);
        
        // Count event types
        exportData.transactions.forEach(tx => {
            const eventType = tx.event_type;
            exportData.metadata.event_types[eventType] = (exportData.metadata.event_types[eventType] || 0) + 1;
        });
        
        // Determine filename
        let filename;
        if (isNewestMonth) {
            // This is the partial/incomplete month
            filename = `current-partial.json`;
        } else {
            // This is a complete month
            filename = `${monthName.toLowerCase()}-${year}.json`;
        }
        
        // Create and download file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
        
        exportedFiles.push({
            filename,
            month: monthName,
            year,
            count: txs.length,
            isComplete
        });
    });
    
    // Show summary
    if (exportedFiles.length === 0) {
        showToast('⚠️ No complete months found. Need data from previous month to validate.');
        return;
    }
    
    const summary = exportedFiles.map(f => 
        `${f.filename} - ${f.month} ${f.year} (${f.count} txs) ${f.isComplete ? '✅' : '⚠️'}`
    ).join('\n');
    
    const filterMsg = window.monthsWithNewData && window.monthsWithNewData.size > 0 
        ? `\n\n📌 Only exported months with new transactions (${window.monthsWithNewData.size} total)`
        : '';
    
    showToast(`✅ Exported ${exportedFiles.length} file(s):${filterMsg}\n${summary}`);
    
    // Clear the tracking after export
    window.monthsWithNewData = null;
}

// Modal Handlers
function setupModalHandlers() {
    // NFT Modal
    document.getElementById('close-nft-modal').onclick = () => {
        document.getElementById('nft-modal').style.display = 'none';
    };
    
    // Raw Data Modal
    document.getElementById('close-raw-modal').onclick = () => {
        document.getElementById('raw-modal').style.display = 'none';
    };
    
    // Timestamp Modal
    document.getElementById('close-timestamp-modal').onclick = () => {
        document.getElementById('timestamp-modal').style.display = 'none';
    };

    // Close on outside click
    window.onclick = (event) => {
        const nftModal = document.getElementById('nft-modal');
        const rawModal = document.getElementById('raw-modal');
        const timestampModal = document.getElementById('timestamp-modal');
        if (event.target === nftModal) {
            nftModal.style.display = 'none';
        }
        if (event.target === rawModal) {
            rawModal.style.display = 'none';
        }
        if (event.target === timestampModal) {
            timestampModal.style.display = 'none';
        }
    };
}

function showNFTModal(tokenId) {
    const nft = nftMetadata.find(n => n.id === parseInt(tokenId));
    const modal = document.getElementById('nft-modal');
    const content = document.getElementById('nft-modal-content');

    if (!nft) {
        content.innerHTML = '<p class="text-gray-400">NFT metadata not found</p>';
        modal.style.display = 'block';
        return;
    }

    // Convert IPFS to gateway URL if needed
    let imageUrl = nft.image;
    if (imageUrl.startsWith('ipfs://')) {
        const ipfsHash = imageUrl.replace('ipfs://', '');
        imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
    }

    content.innerHTML = `
        <div class="grid md:grid-cols-2 gap-6">
            <!-- NFT Image -->
            <div class="text-center">
                <img src="${imageUrl}" alt="${nft.name}" class="mx-auto rounded-lg shadow-xl" style="max-width: 100%; max-height: 500px;">
            </div>
            
            <!-- NFT Details -->
            <div>
                <h4 class="text-3xl font-bold mb-3 text-cyan-400">${nft.name}</h4>
                <p class="text-gray-400 mb-2">Token ID: <span class="text-white font-mono">#${nft.id}</span></p>
                
                <!-- Broken Status -->
                ${nftStatus[nft.id] ? `
                    <div class="mb-4">
                        <p class="text-sm text-gray-400 mb-2">Break Status: 
                            ${nftStatus[nft.id].broken ? 
                                '<span class="broken-indicator">⚠️ BROKEN</span>' : 
                                '<span class="text-green-400 font-semibold">✓ Active</span>'
                            }
                        </p>
                    </div>
                ` : ''}
                
                ${nft.description ? `<p class="text-gray-300 mb-6 leading-relaxed">${nft.description}</p>` : ''}
                
                ${nft.attributes && nft.attributes.length > 0 ? `
                    <div class="mb-4">
                        <h5 class="font-bold text-xl mb-4 text-cyan-400">Traits</h5>
                        <div class="space-y-2">
                            ${nft.attributes.map(attr => `
                                <div class="bg-gray-800 bg-opacity-70 p-3 rounded-lg border border-gray-700">
                                    <p class="text-xs text-gray-400 uppercase tracking-wide mb-1">${attr.trait_type}</p>
                                    <p class="font-semibold text-lg text-white">${attr.value}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${nft.dna ? `<p class="text-xs text-gray-500 mt-4 font-mono">DNA: ${nft.dna}</p>` : ''}
                
                <!-- Data Update Disclaimer -->
                <div class="status-disclaimer mt-6">
                    <p class="text-xs text-yellow-300">
                        ⚠️ <strong>Note:</strong> Break status data is updated every 6 hours from deving.zone. 
                        Live transactions may show status that differs from the current state if an NFT was recently broken.
                    </p>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

function showMultiNFTModal(txHash) {
    const tx = currentBatch.find(t => t.hash === txHash);
    const modal = document.getElementById('nft-modal');
    const content = document.getElementById('nft-modal-content');

    if (!tx || !tx.tokenIds || tx.tokenIds.length === 0) {
        content.innerHTML = '<p class="text-gray-400">No NFTs found</p>';
        modal.style.display = 'block';
        return;
    }

    const nftCount = tx.tokenIds.length;
    const eventType = tx.eventType;

    content.innerHTML = `
        <div class="text-center mb-6">
            <h4 class="text-3xl font-bold text-cyan-400">${eventType}</h4>
            <p class="text-gray-400 mt-2">${nftCount} NFTs in this transaction</p>
        </div>
        
        <div class="nft-grid">
            ${tx.tokenIds.map(tokenId => {
                const imageUrl = getNFTImage(tokenId);
                const isBroken = isNFTBroken(tokenId);
                return `
                    <div class="nft-grid-item" onclick="showNFTModal('${tokenId}')">
                        ${isBroken ? '<div class="broken-banner">⚠️ BROKEN</div>' : ''}
                        <img src="${imageUrl}" alt="NFT ${tokenId}">
                        <div class="nft-id">#${tokenId}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    modal.style.display = 'block';
}

function showClaimModal(txHash) {
    const tx = filteredTransactions.find(t => t.hash === txHash) || currentBatch.find(t => t.hash === txHash);
    const modal = document.getElementById('nft-modal');
    const content = document.getElementById('nft-modal-content');

    console.log('🔍 showClaimModal called for tx:', txHash);
    console.log('🔍 Found transaction:', tx);
    console.log('🔍 Reward data type:', typeof tx?.rewards);
    console.log('🔍 Reward data:', tx?.rewards);

    if (!tx || !tx.rewards) {
        content.innerHTML = '<p class="text-gray-400">Claim details not found</p>';
        modal.style.display = 'block';
        return;
    }

    const rewards = tx.rewards;
    console.log('🔍 Rewards object:', rewards);
    console.log('🔍 ampLunaTotal:', rewards.ampLunaTotal);
    console.log('🔍 Is rewards a string?', typeof rewards === 'string');
    console.log('🔍 Is rewards an object?', typeof rewards === 'object');
    
    const validatorCount = rewards.validatorCount || (rewards.validatorClaims ? rewards.validatorClaims.length : 0);
    const hasTreasurySplit = rewards.ampLunaTreasury && rewards.ampLunaUser;

    content.innerHTML = `
        <div class="text-center mb-6">
            <div class="claim-icon mx-auto mb-4" style="width: 120px; height: 120px; font-size: 3rem;">
                💰
            </div>
            <h4 class="text-3xl font-bold text-cyan-400">Alliance Rewards Claim</h4>
            <p class="text-sm text-gray-400 mt-2">${new Date(tx.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="space-y-6">
            <!-- Main Title -->
            <h5 class="text-2xl font-bold text-cyan-400 text-center">📋 How Alliance Claims Work:</h5>
            
            <!-- Step 1: Claim LUNA -->
            <div class="space-y-3">
                <p class="text-sm text-gray-300 px-4">
                    <span class="text-lg font-bold text-cyan-400">1️⃣</span> 
                    Staking rewards from ALLY (Alliance Asset) claimed as LUNA
                </p>
                
                ${rewards.totalLuna ? `
                    <div class="claim-details-badge" style="background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.4);">
                        <div class="flex justify-between items-center">
                            <div>
                                <h5 class="text-lg font-bold text-white mb-1">💰 Total LUNA Claimed</h5>
                                ${validatorCount > 0 ? `<p class="text-xs text-gray-400">From ${validatorCount} validator${validatorCount > 1 ? 's' : ''}</p>` : ''}
                            </div>
                            <span class="text-3xl font-bold text-yellow-400">${getTokenLogo('LUNA')}${rewards.totalLuna} LUNA</span>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Step 2: Stake LUNA -->
            <div class="space-y-3">
                <p class="text-sm text-gray-300 px-4">
                    <span class="text-lg font-bold text-cyan-400">2️⃣</span> 
                    LUNA staked via Eris Protocol to mint ampLUNA (liquid staking token)
                </p>
                
                <!-- Total ampLUNA Minted -->
                <div class="claim-details-badge" style="background: rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.4);">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-300">💎 Total ampLUNA Minted</span>
                        <span class="text-2xl font-bold text-blue-400">${getTokenLogo('ampLUNA')}${rewards.ampLunaTotal} ampLUNA</span>
                    </div>
                </div>
                
                ${rewards.stakingValidator ? `
                    <!-- Staked to Validator -->
                    <div class="claim-details-badge">
                        <p class="text-sm text-gray-400 mb-3">Staked to Validator via Eris Protocol</p>
                        <div class="bg-gray-900 bg-opacity-50 p-4 rounded-lg">
                            ${formatAddressDisplay(rewards.stakingValidator, { showLogo: true, linkToChainscope: true })}
                        </div>
                        <p class="text-xs text-gray-500 mt-2 text-center">LUNA bonded to this validator to mint ampLUNA (liquid staking token)</p>
                    </div>
                ` : ''}
            </div>
            
            ${hasTreasurySplit ? `
                <!-- Step 3: DAO Takes 10% -->
                <div class="space-y-3">
                    <p class="text-sm text-gray-300 px-4">
                        <span class="text-lg font-bold text-cyan-400">3️⃣</span> 
                        DAO receives 10% ampLUNA for operations
                    </p>
                    
                    <div class="claim-details-badge" style="background: rgba(251, 191, 36, 0.2); border-color: rgba(251, 191, 36, 0.4);">
                        <div class="flex justify-between items-center">
                            <div class="flex-1">
                                <h5 class="text-lg font-bold text-white mb-1">🏛️ DAO Treasury (10%)</h5>
                                ${rewards.treasuryAddress ? `
                                    <div class="mt-2">
                                        ${formatAddressDisplay(rewards.treasuryAddress, { showLogo: true, linkToChainscope: true })}
                                    </div>
                                ` : ''}
                                <p class="text-xs text-gray-500 mt-2">For DAO operations via DAODao.zone</p>
                            </div>
                            <span class="text-2xl font-bold text-yellow-400">${getTokenLogo('ampLUNA')}${rewards.ampLunaTreasury} ampLUNA</span>
                        </div>
                    </div>
                </div>
                
                <!-- Step 4: NFT Holders Get 90% -->
                <div class="space-y-3">
                    <p class="text-sm text-gray-300 px-4">
                        <span class="text-lg font-bold text-cyan-400">4️⃣</span> 
                        Remaining 90% ampLUNA distributed to NFT holders
                    </p>
                    
                    <div class="claim-details-badge" style="background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.4);">
                        <div class="flex justify-between items-center">
                            <div class="flex-1">
                                <h5 class="text-lg font-bold text-white mb-1">🎨 NFT Contract Receives (90%)</h5>
                                ${rewards.recipient ? `
                                    <div class="mt-2">
                                        ${formatAddressDisplay(rewards.recipient, { showLogo: true, linkToChainscope: true })}
                                    </div>
                                ` : ''}
                                <p class="text-xs text-gray-500 mt-2">Alliance DAO NFT holders</p>
                            </div>
                            <span class="text-2xl font-bold text-green-400">${getTokenLogo('ampLUNA')}${rewards.ampLunaUser} ampLUNA</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="border-t border-gray-700 my-4"></div>
            
            <!-- Link to Chainsco.pe -->
            <div class="bg-gray-900 bg-opacity-30 p-4 rounded-lg text-center">
                <p class="text-sm text-gray-400 mb-3">📊 View detailed validator claim breakdown</p>
                <a href="https://chainsco.pe/terra2/tx/${tx.hash}" target="_blank" 
                   class="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition shadow-lg">
                    🔗 View Full Transaction on Chainsco.pe
                </a>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

async function showRawData(txHash) {
    const tx = currentBatch.find(t => t.hash === txHash);
    const modal = document.getElementById('raw-modal');
    const content = document.getElementById('raw-modal-content');

    if (!tx) {
        content.innerHTML = '<p class="text-gray-400">Transaction not found</p>';
        modal.style.display = 'block';
        return;
    }

    // Check if raw transaction data exists in memory
    if (tx.rawTx && Object.keys(tx.rawTx).length > 0) {
        const rawData = JSON.stringify(tx.rawTx, null, 2);
        content.dataset.rawData = rawData;
        content.innerHTML = `
            <div class="mb-4 flex justify-between items-center">
                <h4 class="text-xl font-bold text-cyan-400">Raw Transaction Data</h4>
                <button onclick="copyRawData()" class="btn btn-secondary text-sm">
                    📋 Copy to Clipboard
                </button>
            </div>
            <pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono">${rawData}</pre>
        `;
        modal.style.display = 'block';
        return;
    }

    // If not in memory, try to load from separate raw data file
    content.innerHTML = `
        <div class="mb-4">
            <h4 class="text-xl font-bold text-cyan-400">Raw Transaction Data</h4>
        </div>
        <div class="bg-gray-900 p-6 rounded-lg text-center">
            <div class="animate-pulse">
                <p class="text-gray-400 mb-2">Loading raw transaction data...</p>
            </div>
        </div>
    `;
    modal.style.display = 'block';

    try {
        // Determine which month file to load from
        const monthKey = tx.monthKey || 'current';
        const rawDataUrl = monthKey === 'current' 
            ? `${CONFIG.GITHUB_DATA_URL}/current-partial-raw.json?v=${Date.now()}`
            : `${CONFIG.GITHUB_DATA_URL}/${monthKey}-raw.json?v=${Date.now()}`;

        const response = await fetch(rawDataUrl);
        if (!response.ok) {
            throw new Error('Raw data file not found');
        }

        const rawDataMap = await response.json();
        const rawTx = rawDataMap[txHash];

        if (rawTx) {
            const rawData = JSON.stringify(rawTx, null, 2);
            content.dataset.rawData = rawData;
            content.innerHTML = `
                <div class="mb-4 flex justify-between items-center">
                    <h4 class="text-xl font-bold text-cyan-400">Raw Transaction Data</h4>
                    <button onclick="copyRawData()" class="btn btn-secondary text-sm">
                        📋 Copy to Clipboard
                    </button>
                </div>
                <pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono">${rawData}</pre>
            `;
        } else {
            throw new Error('Transaction not found in raw data file');
        }
    } catch (error) {
        console.error('Error loading raw data:', error);
        content.innerHTML = `
            <div class="mb-4">
                <h4 class="text-xl font-bold text-cyan-400">Raw Transaction Data</h4>
            </div>
            <div class="bg-gray-900 p-6 rounded-lg text-center">
                <p class="text-gray-400 mb-4">Raw transaction data not available.</p>
                <p class="text-sm text-gray-500 mb-4">${error.message}</p>
                <a href="https://chainsco.pe/terra2/tx/${txHash}" 
                   target="_blank" 
                   class="inline-block mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition">
                    View on Chainsco.pe →
                </a>
            </div>
        `;
    }
}
    `;

    modal.style.display = 'block';
}

function showTimestamp(isoTimestamp) {
    const modal = document.getElementById('timestamp-modal');
    const content = document.getElementById('timestamp-modal-content');
    
    const date = new Date(isoTimestamp);
    
    // UTC formatting
    const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(date.getUTCDate()).padStart(2, '0');
    const utcYear = date.getUTCFullYear();
    const utcHours = String(date.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(date.getUTCSeconds()).padStart(2, '0');
    const utcFormatted = `${utcMonth}/${utcDay}/${utcYear} ${utcHours}:${utcMinutes}:${utcSeconds}`;
    
    // Local time formatting (using selected timezone)
    let localFormatted;
    const tz = selectedTimezone === 'auto' ? Intl.DateTimeFormat().resolvedOptions().timeZone : selectedTimezone;
    const tzName = selectedTimezone === 'auto' ? 'Local' : selectedTimezone.split('/')[1].replace('_', ' ');
    
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        localFormatted = formatter.format(date);
    } catch (e) {
        localFormatted = date.toLocaleString();
    }
    
    content.innerHTML = `
        <div style="font-size: 0.95rem;">
            <div style="margin-bottom: 1rem;">
                <div style="color: #9CA3AF; margin-bottom: 0.25rem;">🌍 UTC:</div>
                <div style="color: #2dd4bf; font-weight: 600; font-family: 'Fira Code', monospace;">${utcFormatted}</div>
            </div>
            <div>
                <div style="color: #9CA3AF; margin-bottom: 0.25rem;">📍 Your Time (${tzName}):</div>
                <div style="color: #2dd4bf; font-weight: 600; font-family: 'Fira Code', monospace;">${localFormatted}</div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Copy raw data from modal
function copyRawData() {
    const content = document.getElementById('raw-modal-content');
    const rawData = content.dataset.rawData;
    if (rawData) {
        copyToClipboard(rawData, 'Raw transaction data');
    }
}

// Copy to Clipboard Function
function copyToClipboard(text, displayLabel) {
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✅ Copied: ${displayLabel}`);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('❌ Failed to copy to clipboard', 'error');
    });
}

// Column Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const columnToggles = document.querySelectorAll('.column-toggle');
    columnToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const column = this.dataset.column;
            const cells = document.querySelectorAll(`.col-${column}`);
            
            cells.forEach(cell => {
                if (this.checked) {
                    cell.classList.remove(`hide-col-${column}`);
                } else {
                    cell.classList.add(`hide-col-${column}`);
                }
            });
        });
    });
    
    // Show Load Next Month button when scrolled near bottom
    const tableWrapper = document.querySelector('.table-wrapper');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (tableWrapper && loadMoreContainer) {
        tableWrapper.addEventListener('scroll', function() {
            const scrollTop = this.scrollTop;
            const scrollHeight = this.scrollHeight;
            const clientHeight = this.clientHeight;
            
            // Show button when within 200px of bottom
            if (scrollHeight - scrollTop - clientHeight < 200) {
                loadMoreContainer.style.display = 'block';
            } else {
                loadMoreContainer.style.display = 'none';
            }
        });
    }
