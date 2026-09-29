/*
  提交下单信息接口走HTTP
  成交信息走WS
  由于成交信息由WS返回可能快于提交信息返回，导致界面先显示成交信息后显示提交信息

  提交下单成功HTTP返回信息中包含字段 - orderId
  成交WS返回信息中也包含字段 - orderId，即使同一单会有多个成交记录也保有同一个orderId
  方案：
    1、下单http返回后 判断 ORDER_ID_CHECK_LIST 中是否存在相同的orderId，
      有相同orderId - 则表示已提示过对应的WS成交信息 - 不提示当前http提交返回结果
      无相同orderId - 则表示未提示过对应的WS成交信息 - 提示当前http返回结果
    2、ws推送成交消息中，有orderId，则将orderId存入 ORDER_ID_CHECK_LIST，同时提示成交信息
 */
const ORDER_ID_CHECK_LIST = [];

export function hasOrderId(orderId) {
  return ORDER_ID_CHECK_LIST.includes(orderId);
}

export function neverGotOrderId(orderId) {
  if (ORDER_ID_CHECK_LIST.length > 10) {
    keepLengthTo5();
  }
  return !hasOrderId(orderId);
}

export function addOrderId(orderId) {
  if (orderId && neverGotOrderId(orderId)) {
    ORDER_ID_CHECK_LIST.push(orderId);
  }
}

export function keepLengthTo5() {
  ORDER_ID_CHECK_LIST.splice(0, 5);
}

export function rmOrderId(orderId) {
  if (orderId) {
    const idx = ORDER_ID_CHECK_LIST.indexOf(orderId);
    if (idx > -1) {
      ORDER_ID_CHECK_LIST.splice(idx, 1);
    }
  }
}

export function clearMap() {
  ORDER_ID_CHECK_LIST.length = 0;
}

// export function showMap() {
//   window.console.log(ORDER_ID_CHECK_LIST);
// }
