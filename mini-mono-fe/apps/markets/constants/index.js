import { FUTURE_TYPE } from 'libs/ws-service/src/utils';


export const ALL_SECTION_ID = 1
// 一级
export const FIRST_LAYER = {
  FAV: 'favorite',
  SPOT: 'spot',
  FUTURE: 'futures',
  BLOCK: 'block'
};
// 二级
export const SECOND_LAYER = {
  ALL: 'all',
// 其他的都是走后端
};

// 二级 fav
export const SECOND_FAV_LAYER = {
  ALL: 'all',
  SPOT: 'spot',
  FUTURE: 'futures',
  BLOCK: 'block'
};


// 一级/收藏二级共用顺序：合约 → 现货 → 大宗
export const commonList = [
  {
    label: 'futures',
    value: FIRST_LAYER.FUTURE
  },
  {
    label: 'spot',
    value: FIRST_LAYER.SPOT
  },
  {
    label: 'tradfi',
    value: FIRST_LAYER.BLOCK
  },
];
// layer1
export const categoryList = [
  {
    label: 'favorite',
    value: FIRST_LAYER.FAV
  },
  ...commonList
];

// 收藏二级：合约 → 现货（无全部）
export const favLayerList = [...commonList];

export const futuresLayerList = [
  {
    label: 'linear-future',
    value: FUTURE_TYPE.LINEAR
  },
  // {
  //   label: 'inverse-future',
  //   value: FUTURE_TYPE.INVERSE
  // }
];

export const SORT_TYPE = {
  PRICE: 'price',
  '24CHANGE': '24change',
  VOL: 'vol',
  HIGH_LOW: 'highLow'
};
