import { CryptoAsset, NetworkConfig, SupportedCurrency, Transaction } from '../types/wallet';

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    chainId: 1,
    explorerUrl: 'https://etherscan.io/tx/',
    baseFee: 2.45,
    feeUnit: 'ETH',
    confirmationTime: '~15 secs',
    isSupported: true,
    addressPlaceholder: '0x71C...3974'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin Core',
    symbol: 'BTC',
    chainId: 'btc-main',
    explorerUrl: 'https://mempool.space/tx/',
    baseFee: 1.80,
    feeUnit: 'BTC',
    confirmationTime: '~10 mins',
    isSupported: true,
    addressPlaceholder: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
  },
  {
    id: 'solana',
    name: 'Solana Network',
    symbol: 'SOL',
    chainId: 'sol-main',
    explorerUrl: 'https://solscan.io/tx/',
    baseFee: 0.005,
    feeUnit: 'SOL',
    confirmationTime: '~400 ms',
    isSupported: true,
    addressPlaceholder: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    explorerUrl: 'https://bscscan.com/tx/',
    baseFee: 0.15,
    feeUnit: 'BNB',
    confirmationTime: '~3 secs',
    isSupported: true,
    addressPlaceholder: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97'
  },
  {
    id: 'polygon',
    name: 'Polygon PoS',
    symbol: 'MATIC',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com/tx/',
    baseFee: 0.02,
    feeUnit: 'POL',
    confirmationTime: '~2 secs',
    isSupported: true,
    addressPlaceholder: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ARB',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io/tx/',
    baseFee: 0.08,
    feeUnit: 'ETH',
    confirmationTime: '~1 sec',
    isSupported: true,
    addressPlaceholder: '0x17fa2b683348b610c30a54f05b4b1a134bc268d3'
  }
];

export const INITIAL_ASSETS: CryptoAsset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    color: '#F7931A',
    price: 64280.50,
    change24h: 3.42,
    balance: 0.845,
    usdValue: 54317.02,
    network: 'Bitcoin Core',
    address: 'bc1qprm7w8q3e4m92wpxl0f9d9s8z8x2w109prsm',
    decimals: 8,
    marketCap: 1264800000000,
    high24h: 65120.00,
    low24h: 62900.20,
    volume24h: 28450120000,
    sparkline: [62800, 63100, 62950, 63400, 63200, 63850, 64100, 63900, 64280]
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    color: '#627EEA',
    price: 3450.25,
    change24h: -1.18,
    balance: 6.25,
    usdValue: 21564.06,
    network: 'Ethereum Mainnet',
    address: '0x71C5A869bACD44E72d5619A07E05C5e7d5813974',
    decimals: 18,
    marketCap: 414200000000,
    high24h: 3540.00,
    low24h: 3410.80,
    volume24h: 15400230000,
    sparkline: [3520, 3510, 3480, 3490, 3460, 3430, 3445, 3430, 3450]
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    icon: '◎',
    color: '#14F195',
    price: 154.80,
    change24h: 7.64,
    balance: 42.50,
    usdValue: 6579.00,
    network: 'Solana Network',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    decimals: 9,
    marketCap: 72100000000,
    high24h: 158.20,
    low24h: 143.10,
    volume24h: 4280000000,
    sparkline: [144, 146, 145, 149, 151, 150, 153, 152, 154.8]
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '₮',
    color: '#26A17B',
    price: 1.00,
    change24h: 0.02,
    balance: 4850.00,
    usdValue: 4850.00,
    network: 'Ethereum (ERC-20)',
    address: '0x71C5A869bACD44E72d5619A07E05C5e7d5813974',
    decimals: 6,
    marketCap: 114500000000,
    high24h: 1.002,
    low24h: 0.998,
    volume24h: 42100000000,
    sparkline: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '$',
    color: '#2775CA',
    price: 1.00,
    change24h: 0.01,
    balance: 3200.00,
    usdValue: 3200.00,
    network: 'Solana Network',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    decimals: 6,
    marketCap: 34100000000,
    high24h: 1.001,
    low24h: 0.999,
    volume24h: 6800000000,
    sparkline: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    name: 'BNB Chain',
    icon: '❖',
    color: '#F3BA2F',
    price: 582.40,
    change24h: 2.15,
    balance: 4.80,
    usdValue: 2795.52,
    network: 'BNB Smart Chain',
    address: '0x71C5A869bACD44E72d5619A07E05C5e7d5813974',
    decimals: 18,
    marketCap: 89000000000,
    high24h: 590.10,
    low24h: 569.00,
    volume24h: 1120000000,
    sparkline: [570, 572, 569, 574, 578, 576, 581, 579, 582.4]
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP Ledger',
    icon: '✕',
    color: '#23292F',
    price: 0.584,
    change24h: -0.85,
    balance: 2450.00,
    usdValue: 1430.80,
    network: 'XRP Ledger',
    address: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
    decimals: 6,
    marketCap: 32800000000,
    high24h: 0.598,
    low24h: 0.579,
    volume24h: 980000000,
    sparkline: [0.59, 0.588, 0.585, 0.582, 0.586, 0.581, 0.583, 0.582, 0.584]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    userId: 'demo-user',
    txHash: '0x8f2c31e9a4d87b1c4e09f582a93c7d61e2b4f59081a2c3b4d5e6f708192a3b4c',
    type: 'receive',
    asset: 'ETH',
    amount: 1.5,
    usdValue: 5175.38,
    fromAddress: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    toAddress: '0x71C5A869bACD44E72d5619A07E05C5e7d5813974',
    network: 'Ethereum Mainnet',
    fee: 2.14,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 35, // 35m ago
    note: 'Payment from Binance Staking'
  },
  {
    id: 'tx-002',
    userId: 'demo-user',
    txHash: '0x4a9b2c3d1e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b',
    type: 'send',
    asset: 'SOL',
    amount: 8.0,
    usdValue: 1238.40,
    fromAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    toAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    network: 'Solana Network',
    fee: 0.005,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4h ago
    note: 'Transfer to Cold Vault'
  },
  {
    id: 'tx-003',
    userId: 'demo-user',
    txHash: '0x1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    type: 'swap',
    asset: 'USDT',
    amount: 1500,
    usdValue: 1500.00,
    fromAddress: '0x71C5A869bACD44E72d5619A07E05C5e7d5813974',
    toAddress: '0x71C5A869bACD44E72d5619A07E05C5e7d5813974',
    network: 'Ethereum Mainnet',
    fee: 3.12,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 22, // 22h ago
    swapToAsset: 'ETH',
    swapToAmount: 0.435,
    note: 'Uniswap v3 Liquidity Swap'
  },
  {
    id: 'tx-004',
    userId: 'demo-user',
    txHash: 'bc1q9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f',
    type: 'receive',
    asset: 'BTC',
    amount: 0.12,
    usdValue: 7713.66,
    fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    toAddress: 'bc1qprm7w8q3e4m92wpxl0f9d9s8z8x2w109prsm',
    network: 'Bitcoin Core',
    fee: 1.80,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    note: 'Mining pool payout'
  },
  {
    id: 'tx-005',
    userId: 'demo-user',
    txHash: '0xee23a10b48c6f90112aa56b107877bf73ce8b0bad5f97987b1c4e09f582a93c7',
    type: 'send',
    asset: 'USDC',
    amount: 500,
    usdValue: 500.00,
    fromAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    toAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    network: 'Solana Network',
    fee: 0.005,
    status: 'completed',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    note: 'Subscribed to Web3 Infrastructure'
  }
];

export const INITIAL_CONTACTS = [
  {
    id: 'c-1',
    name: 'Hardware Ledger Cold',
    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
    network: 'Ethereum Mainnet',
    symbol: 'ETH',
    notes: 'Safe Vault Cold Storage'
  },
  {
    id: 'c-2',
    name: 'Phantom Solana Vault',
    address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    network: 'Solana Network',
    symbol: 'SOL',
    notes: 'Staking Wallet'
  },
  {
    id: 'c-3',
    name: 'Bitcoin Hardware Signer',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    network: 'Bitcoin Core',
    symbol: 'BTC',
    notes: 'Multi-sig signer'
  }
];

export const CURRENCY_CONVERSION: Record<SupportedCurrency, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: '$', rate: 1.0, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: true },
  GBP: { symbol: '£', rate: 0.78, prefix: true },
  JPY: { symbol: '¥', rate: 153.2, prefix: true },
  AUD: { symbol: 'A$', rate: 1.52, prefix: true }
};

export const MOCK_CHART_TIMEFRAMES: Record<string, { changePercent: number; points: { time: string; value: number }[] }> = {
  '1D': {
    changePercent: 2.85,
    points: [
      { time: '00:00', value: 92100 },
      { time: '04:00', value: 91800 },
      { time: '08:00', value: 92450 },
      { time: '12:00', value: 93800 },
      { time: '16:00', value: 93200 },
      { time: '20:00', value: 94100 },
      { time: '23:59', value: 94736 }
    ]
  },
  '1W': {
    changePercent: 5.62,
    points: [
      { time: 'Mon', value: 89400 },
      { time: 'Tue', value: 90200 },
      { time: 'Wed', value: 89900 },
      { time: 'Thu', value: 91500 },
      { time: 'Fri', value: 92800 },
      { time: 'Sat', value: 93600 },
      { time: 'Sun', value: 94736 }
    ]
  },
  '1M': {
    changePercent: 14.80,
    points: [
      { time: 'Week 1', value: 82500 },
      { time: 'Week 2', value: 85200 },
      { time: 'Week 3', value: 89800 },
      { time: 'Week 4', value: 94736 }
    ]
  },
  '3M': {
    changePercent: 28.45,
    points: [
      { time: 'Jul', value: 73800 },
      { time: 'Aug', value: 81200 },
      { time: 'Sep', value: 94736 }
    ]
  },
  '1Y': {
    changePercent: 86.20,
    points: [
      { time: 'Q1', value: 51200 },
      { time: 'Q2', value: 64800 },
      { time: 'Q3', value: 78500 },
      { time: 'Q4', value: 94736 }
    ]
  },
  'ALL': {
    changePercent: 245.8,
    points: [
      { time: '2022', value: 27400 },
      { time: '2023', value: 43200 },
      { time: '2024', value: 72100 },
      { time: '2025', value: 86900 },
      { time: '2026', value: 94736 }
    ]
  }
};
