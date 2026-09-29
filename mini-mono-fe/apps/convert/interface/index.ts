import { SwapStatusEnum } from '~/enums';

export interface ISymbolSwapConfig {
  /** 基础币种最低兑换数量，最大 8 位精度 */
  base_token_min_swap_quantity: string;

  /** 基础币种最高兑换数量，最大 8 位精度 */
  base_token_max_swap_quantity: string;

  /** 基础代币精度 */
  base_precision: number;

  /** 计价币种最低兑换数量，最大 8 位精度 */
  quote_token_min_swap_quantity: string;

  /** 计价币种最高兑换数量，最大 8 位精度 */
  quote_token_max_swap_quantity: string;

  /** 计价代币精度 */
  quote_precision: number;

  /** 币对兑换手续费，最大 8 位精度 */
  symbol_swap_fee_rate: string;

  /** 币对，大写，如 ETH_USDT */
  symbol: string;

  /** 基础币种，大写，如 BTC/ETH/USDT/SOL */
  base_token: string;

  /** 计价币种，大写，如 BTC/ETH/USDT/SOL */
  quote_token: string;

  /** 基础币种现货资产 */
  base_token_balance?: string;

  base_token_balance_in_usd?: string;
  base_token_balance_in_fiat?: string;

  /** 计价币种现货资产 */
  quote_token_balance?: string;

  quote_token_balance_in_usd?: string;
  quote_token_balance_in_fiat?: string;
}


export interface ISymbolAsset {
  tokenId: string;
  tokenName: string;
  total: string;
  free: string;
}

export interface ISymbolLastPrice {
  symbol?: string;
  /** 买入价格，最大 8 位精度 */
  buy_price: string;

  /** 买入兑换率，最大 8 位精度 */
  buy_swap_rate: string;

  /** 卖出价格，最大 8 位精度 */
  sell_price: string;

  /** 卖出兑换率，最大 8 位精度 */
  sell_swap_rate: string;
}

export interface ISymbolSwapQuoteInfo {
  /** 消耗币种，大写: BTC, ETH, USDT, SOL */
  from_token: string;

  /** 消耗币种数量，最大 8 位精度 */
  from_token_quantity: string;

  /** 获得币种，大写: BTC, ETH, USDT, SOL */
  to_token: string;

  /** 获得币种数量，最大 8 位精度 */
  to_token_quantity: string;

  /** 价格，最大 8 位精度 */
  price: string;

  /** 兑换率，最大 8 位精度 */
  swap_rate: string;

  /** 币对兑换手续费率，最大 8 位精度 */
  symbol_swap_fee_rate: string;

  /** 币对兑换手续费，最大 8 位精度 */
  symbol_swap_fee_amount?: string;

  /** 兑换业务ID */
  swap_id?: string;

  /** 兑换过期时间，秒级时间戳 */
  expire_time?: number;

  /** 兑换状态：Y 成功 / N 失败 */
  swap_status?: SwapStatusEnum;

  /**交易时间，秒级时间戳 */
  time?: number;
}

