import starkwareCrypto from '@starkware-industries/starkware-crypto-utils';
import { getLocalStorage } from 'common/utils/storageData';
import {
  IOrderCreateReq
} from 'common/types/services/order';

const AMOUNTBUYMAP={
  'BTC': 1e10,
  'ETH': 1e8,
  'BTCUSDT': 1e10,
  'ETHUSDT': 1e8,
}
const TOKENBUYMAP={
  'BTC': '0x4254432d3130000000000000000000',
  'ETH': '0x4554482d3800000000000000000000',
  'BTCUSDT': '0x4254432d3130000000000000000000',
  'ETHUSDT': '0x4554482d3800000000000000000000'
}

function createSignMsg(params: IOrderCreateReq) {
  let cacl_price:number | string=params.price;
  if(params.action==='PositionClose' && params.orderType==='Market'){
    cacl_price=(Number(params.price) || Number(params.marketPrice))*(params.side==='Buy'?1.2:0.8);
  }else if(params.orderType==='Market'){
    cacl_price=(Number(params.price) || Number(params.marketPrice))*(params.side==='Buy'?1.2:0.8);
  }else if(params.orderType==='Limit'){
    cacl_price=Number(params.price)
  }
  const tokenSell=params.side==='Buy'?'0xa21edc9d9997b1b1956f542fe95922518a9e28ace11b7b2972a1974bf5971f':TOKENBUYMAP[String(params.coin)] || TOKENBUYMAP[String(params.symbol)];
  const tokenBuy=params.side==='Buy'? TOKENBUYMAP[String(params.coin)] || TOKENBUYMAP[String(params.symbol)]:'0xa21edc9d9997b1b1956f542fe95922518a9e28ace11b7b2972a1974bf5971f';
  const amountSell=params.side==='Buy'
  ?
  Math.round((Number(params.qtyX) * 1e-8)*Number(cacl_price)*1e6)
  :
  Math.round((Number(params.qtyX) * 1e-8)*(AMOUNTBUYMAP[String(params.coin)] || AMOUNTBUYMAP[String(params.symbol)]));
  const amountBuy=params.side==='Buy'
  ?
  Math.round((Number(params.qtyX) * 1e-8)*(AMOUNTBUYMAP[String(params.coin)] || AMOUNTBUYMAP[String(params.symbol)]))
  :
  Math.round((Number(params.qtyX) * 1e-8)*Number(cacl_price)*1e6);
  const paramsArg=[
    Number(getLocalStorage('GA_UID')), // - vault_sell (uint64)
    Number(getLocalStorage('GA_UID')), // - vault_buy (uint64)
    String(amountSell), // - amount_sell (uint63 decimal str)
    String(amountBuy), // - amount_buy (uint63 decimal str)
    String(tokenSell), // - token_sell (hex str with 0x prefix < prime)
    String(tokenBuy), // - token_buy (hex str with 0x prefix < prime)
    666, // - nonce (uint31)
    999999, // - expiration_timestamp (uint22)
    '0xa21edc9d9997b1b1956f542fe95922518a9e28ace11b7b2972a1974bf5971f', // - token (hex str with 0x prefix < prime)
    Number(getLocalStorage('GA_UID')), // - fee_source_vault_id (uint31)
    Math.ceil((Number(params.qtyX) * 1e-8*Number(cacl_price)*0.00075 * 1e6)) // - amount (uint63 decimal str)
  ]
//  console.log(paramsArg,'paramsArg')
  const msgHash = starkwareCrypto.getLimitOrderMsgHashWithFee(
    ...paramsArg
  );
 // console.log(msgHash,'msgHash')

  const privateKey=JSON.parse(localStorage.getItem('dex:key') || '{}')?.privateKey.substring(2);
 // console.log(privateKey,'privateKey')
  const keyPair = starkwareCrypto.ec.keyFromPrivate(privateKey, 'hex');
 // console.log(keyPair,'keyPair')
  const msgSignature = starkwareCrypto.sign(keyPair, msgHash);
  const { r, s } = msgSignature;
  // console.log(`0x${r.toString(16)}`,'r');
 // console.log(`0x${s.toString(16)}`, 's');
  return {
    r:`0x${r.toString(16)}`,
    s:`0x${s.toString(16)}`,
    paramsArg
  }
}

export {
  createSignMsg
}
