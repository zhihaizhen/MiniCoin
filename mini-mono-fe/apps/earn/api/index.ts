import { Env } from '@region-lib/env';
import { fetch, request } from '@better-bit-fe/base-utils';

const { API_HOST } = Env;


/**
 * 理财资产总览
 */
export const getWalletList = () => {
  return request({
    url: `${API_HOST}/defi/private/v1/wallet_list`,
    method: 'get'
  });
};

/**
 * 获取订单类型、钱包流水类型等基本信息
 */
export const getBasicInfo = () => {
  return request({
    url: `${API_HOST}/defi/public/v1/basic_info`,
    method: 'get'
  });
};
/**
 * 产品推荐列表
 */
export interface ProductRcommendParams {
  top_category?: string;
}

export const getProductRcommend = (params?: ProductRcommendParams) => {
  return request({
    url: `${API_HOST}/defi/public/v2/product_recommend`,
    method: 'get',
    params: {
      query_type: 'recommend',
      ...params
    }
  });
};

/**
 * 理财产品列表
 * 支持分页
 * 默认： USDT
 */
export const getProductList = (params) => {
  return request({
    url: `${API_HOST}/defi/public/v2/product_list_type`,
    method: 'get',
    params
  });
};
/**
 * 简单赚币产品
 */
export const getPublicSimleEarnList = (params) => {
  return request({
    url: `${API_HOST}/defi/public/v2/simple-earn/list`,
    method: 'get',
    params
  });
};
/**
 * 简单赚币产品
 */
export const getPrivateSimleEarnList = (params) => {
  return request({
    url: `${API_HOST}/defi/private/v2/simple-earn/list`,
    method: 'get',
    params
  });
};

interface ISimpleEarnSet {
  product_id?:number,
  product_coin?:string,
  open_all?:boolean,
  status: 'open' | 'close'
}

/**
 * 简单赚币开关按钮接口
 * @param data
 */
export const postSimpleEarnSet = (data: ISimpleEarnSet) => {
  return fetch({
    url: `${API_HOST}/defi/private/v2/simple-earn/set`,
    method: 'post',
    data
  });
};

/**
 * 产品详情
 * @param id
 */
export const getProductDetail = (id) => {
  return request({
    url: `${API_HOST}/defi/private/v1/product_detail?product_id=${id}`,
    method: 'get',
    showErrorMessage: false
  });
};

/**
 * 产品详情
 * @param id
 */
export const getPublicProductDetail = (id) => {
  return request({
    url: `${API_HOST}/defi/public/v2/product_detail?product_id=${id}`,
    method: 'get',
    showErrorMessage: false
  });
};

/**
 * 请求产品申购接口参数
 */
export interface ProductSubscribeParams {
  product_id: string; // 产品id
  purchase_share: string; // 产品份额
  auto_renew?: boolean; // 自动续投和申购标识
}

/**
 * 产品申购
 * @param data
 */
export const postProductSubscribe = (data: ProductSubscribeParams) => {
  return request({
    url: `${API_HOST}/defi/private/v1/product_subscribe`,
    method: 'post',
    data
  });
};

/**
 * 链上赚币-质押
 * @param data
 */
export const postChainStaking = (data: ProductSubscribeParams) => {
  return request({
    url: `${API_HOST}/defi/private/v1/onchain/staking`,
    method: 'post',
    data
  });
};



/**
 * 请求产品赎回接口参数
 */
export interface ProductRedeemParams {
  product_id: number; // 产品id
  product_category: "liquid" | "fixed"; // 产品类别：活期 liquid 定期 fixed
  purchase_share: number; // 产品份额
}

/**
 * 产品赎回
 * @param params
 */
export const postProductRedeem = (params: ProductRedeemParams) => {
  return request({
    url: `${API_HOST}/defi/private/v1/product_redeem`,
    method: 'post',
    params
  });
};

/**
 * 请求产品赎回接口参数
 */
export interface OrderListParams {
  coin: string; // 产品id
  category: "liquid" | "fixed"; // 产品类别：活期 liquid 定期 fixed
}

/**
 * 订单列表
 * @param params
 */
export const getOrderList = (params: OrderListParams) => {
  return request({
    url: `${API_HOST}/defi/private/v1/order_list`,
    method: 'get',
    params
  });
};


/**
 * 资金记录接口参数
 */
export interface WalletFlowParams {
  coin: string; //币种信息
  from: number; // 开始时间
  to: number; // 截止时间
  flow_type: number; // 资金类型：
  change_amount: number; // 变动金额
}

/**
 * 资金记录
 * @param params
 */
export const getWalletFlowList = (params: WalletFlowParams) => {
  return request({
    url: `${API_HOST}/defi/private/v1/wallet_flow_list`,
    method: 'get',
    params
  });
};

export interface PositionParams {
  query_type?: string; //product_name:按照产品名称聚合coin:按照币种聚合
  coin?: string; // 币种名称
  product_category?: string //  产品类型 fixed liquid rush  defi pos simple-earn
  top_category?: string //顶级分类 SAVING | SAVING-ONCHAIN |  SIMPLE-EARN
}

/**
 * 持仓列表
 * @param params
 */
export const getPositionList = (params: PositionParams) => {
  return request({
    url: `${API_HOST}/defi/private/v2/position_list`,
    method: 'get',
    params
  });
};


export const getExchangeRate = () => {
  return request({
    url: `${API_HOST}/asset/fiat/public/v1/exchange-rate`,
    method: 'get'
  });
};

export const getDynamicSymbol = () => {
  return request({
    url: `${API_HOST}/trade/public/v1/market/dynamic_symbol`,
    method: 'get'
  });
};
/**
 * 获取币种，供筛选列表用
 * @param params
 */
export const getCoinList = (params) => {
  return request({
    url: `${API_HOST}/dex-portal-service/dex/transation/deposit-config`,
    method: 'get',
    params
  })
}
/**
 * 获取公告
 * @param data
 */
export const postNotificationList = (data) => {
  return fetch({
    url: `${API_HOST}/commom-public/index/public/v1/announcement/list`,
    method: 'POST',
    data
  });
};

export const getSpotMarket = () => {
  return fetch({
    url: `${API_HOST}/spot/public/v1/quote/market/ticker/24hr?realtimeInterval=24h`,
    method: 'get'
  });
};

/**
 * 获取各个币种的资产
 */
export const getCoinAssets = () => {
  return fetch({
    url: `${API_HOST}/spot/private/v1/asset/get`,
    method: 'get'
  });
};

/**
 * 获取用户身份标签 比如：新手
 */
export const getUserTagInfo = () => {
  return fetch({
    url: `${API_HOST}/defi/private/v1/user_info`,
    method: 'get'
  });
};

export const getQuoteTokens = () => {
  return fetch({
    url: `${API_HOST}/spot/public/v1/config/quote_tokens`,
    method: 'get',
    showErrorMessage: false
  });
};

export const getUserInviteInfo = () => {
  return fetch({
    url: `${API_HOST}/commom-public/user-invite/v1/private/link/get-default`,
    method: 'GET',
    showErrorMessage: true
  });
};


/**
 * vip申请
 * @param data
 */
export const postVipApply = (data:{contact_type: string, contact_account: string}) => {
  return fetch({
    url: `${API_HOST}/defi/private/v1/vip_apply`,
    method: 'POST',
    data
  });
};
