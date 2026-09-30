export type AssetSymbol = 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL' | 'XRP' | 'BNB';

export interface CryptoAsset {
  id: string;
  symbol: AssetSymbol;
  name: string;
  icon: string;
  color: string;
  price: number;
  change24h: number;
  balance: number;
  usdValue: number;
  network: string;
  address: string;
  decimals: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  sparkline: number[];
}

export type TransactionType = 'send' | 'receive' | 'swap' | 'deposit' | 'withdraw';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  txHash: string;
  type: TransactionType;
  asset: AssetSymbol | string;
  amount: number;
  usdValue: number;
  fromAddress: string;
  toAddress: string;
  network: string;
  fee: number;
  status: TransactionStatus;
  timestamp: number;
  note?: string;
  swapToAsset?: AssetSymbol | string;
  swapToAmount?: number;
  isPrismDirect?: boolean;
  recipientHandle?: string;
  senderHandle?: string;
}

export interface NetworkConfig {
  id: string;
  name: string;
  symbol: string;
  chainId: number | string;
  explorerUrl: string;
  baseFee: number;
  feeUnit: string;
  confirmationTime: string;
  isSupported: boolean;
  addressPlaceholder: string;
}

export interface Contact {
  id: string;
  name: string;
  address: string;
  network: string;
  symbol: AssetSymbol | string;
  prismHandle?: string;
  notes?: string;
}

export interface PrismUserLookup {
  handle: string;
  name: string;
  avatar: string;
  verified: boolean;
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

export interface UserSettings {
  currency: SupportedCurrency;
  theme: 'dark' | 'light';
  hideBalance: boolean;
  autoLockMinutes: number;
  twoFactorEnabled: boolean;
  prismHandle: string;
  notifications: {
    priceAlerts: boolean;
    txConfirmations: boolean;
    securityAlerts: boolean;
  };
}

export type NavigationTab = 
  | 'dashboard'
  | 'wallet'
  | 'markets'
  | 'transactions'
  | 'send'
  | 'receive'
  | 'swap'
  | 'settings';
