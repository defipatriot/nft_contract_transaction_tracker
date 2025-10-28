// Alliance DAO TX Explorer - Configuration
// Version 4.0

const CONFIG = {
    // Terra Network
    RPC_URL: 'https://terra-rpc.polkachu.com',
    LCD_API: 'https://terra-lcd.publicnode.com',
    
    // Core Contracts
    NFT_CONTRACT: 'terra1phr9fngjv7a8an4dhmhd0u0f98wazxfnzccqtyheq4zqrrp4fpuqw3apw9',
    AMPLUNA_TOKEN: 'terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct',
    
    // Governance
    DAODAO_STAKING: 'terra1c57ur376szdv8rtes6sa9nst4k536dynunksu8tx5zu4z5u3am6qmvqx47',
    DAODAO_VOTING: 'terra14gv57x9lmuc04jzsmsz5f2heyfxfndey2v8hkkjt7z9p6d7xw35stx69j2',
    
    // Marketplaces
    BBL_MARKETPLACE: 'terra1ej4cv98e9g2zjefr5auf2nwtq4xl3dm7x0qml58yna2ml2hk595s7gccs9',
    BLUNA_TOKEN: 'terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml',
    BOOST_MARKETPLACE: 'terra1kj7pasyahtugajx9qud02r5jqaf60mtm7g5v9utr94rmdfftx0vqspf4at',
    BOOST_FEE_WALLET: 'terra1rppeahhmtvy4fs9xr9zkjrf4xs9ak4ygy62slq',
    
    // Tools
    ENTERPRISE_TOOL: 'terra1e54tcdyulrtslvf79htx4zntqntd4r550cg22sj24r6gfm0anrvq0y8tdv',
    OTC_CONTRACT: 'terra1wm7rag4feqm2w3qfj85gsmn3g38mlxtfvu7zmsydnd8ez3dlkdks0n8yk0',
    OTC_OPERATOR: 'terra1hkqq2sy3dvvgt8sw2h0nfc3nzufa27d3xj69cf',
    OTC_FEE_WALLET: 'terra1qdpyuvy9cjmelly6cf604ck7srpt040nee9cjy',
    
    // Legacy (deprecated addresses)
    NFT_SWITCH: 'terra1c22qq8c5frqg2f2n95ksm5nct255fglk2ldm3u5chmqtu5k82gnq5y0j89',
    BOOST_PROTOCOL: 'terra1ss4tkg2de6r99s4s2cr92g2v2wea06v82klars4pelxxvsrsmgcsle7t5d',
    
    // Treasury
    DAO_TREASURY: 'terra1sffd4efk2jpdt894r04qwmtjqrrjfc52tmj6vkzjxqhd8qqu2drs3m5vzm',
    
    // Data URLs - UPDATED REPO NAME
    NFT_METADATA_URL: 'https://raw.githubusercontent.com/defipatriot/nft-metadata/main/Small%20Image%20Full%20Metadata.txt',
    NFT_STATUS_URL: 'https://deving.zone/en/nfts/alliance_daos.json',
    ADDRESS_BOOK_URL: 'https://raw.githubusercontent.com/defipatriot/transaction-tracker/main/alliance-dao-config.json',
    GITHUB_DATA_URL: 'https://raw.githubusercontent.com/defipatriot/transaction-tracker/main'
};

const TOKENS = [
    { id: 'eris-amplified-luna', name: 'ampLUNA', symbol: 'ampLUNA' },
    { id: 'backbone-labs-staked-luna', name: 'bLUNA', symbol: 'bLUNA' },
    { id: 'terra-luna-2', name: 'LUNA', symbol: 'LUNA' },
    { id: 'astroport', name: 'ASTRO', symbol: 'ASTRO' }
];

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, TOKENS };
}
