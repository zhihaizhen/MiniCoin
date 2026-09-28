import type { CSSProperties } from 'react';
import { basePath } from '@better-bit-fe/base-utils';

export type ContactMethod = 'telegram' | 'whatsapp';

export const PRODUCTS = [
  { title: 'vip.wealthmanage.product1', rate: '4.3% ~ 12.1%', coin: 'usdt' },
  { title: 'vip.wealthmanage.product2', rate: '4%~11.3%', coin: 'usdt' },
  { title: 'vip.wealthmanage.product3', rate: '2%~5.8%', coin: 'btc' }
];

export const TABLE_DATA = [
  {
    product: 'vip.table.customizable.product1',
    content: 'vip.table.customizable.content1',
    currency: 'vip.table.payment.currency1'
  },
  {
    product: 'vip.table.customizable.product2',
    content: 'vip.table.customizable.content2',
    currency: 'BTC/USDT'
  }
];

export const TABLE_HEADERS: [string, string][] = [
  ['vip.table.customizable.product', '可定制产品'],
  ['vip.table.customizable.content', '可定制内容'],
  ['vip.table.payment.currency', '支付币种']
];

export const FAQ_KEYS = [
  {
    title: 'vip.fqa.title.1',
    contents: ['vip.fqa.content.1.1', 'vip.fqa.content.1.2']
  },
  { title: 'vip.fqa.title.2', contents: ['vip.fqa.content.2.1'] },
  { title: 'vip.fqa.title.3', contents: ['vip.fqa.content.3.1'] }
];

export const VIP_BENEFITS: {
  title: [string, string];
  desc: [string, string];
}[] = [
  {
    title: ['vip.wealth.center', '尊享理财中心'],
    desc: ['vip.wealth.center.desc', 'VIP 定制财富计划']
  },
  {
    title: ['vip.manager', '1对1 VIP 管家'],
    desc: ['vip.manager.desc', '专属客服经理全程陪跑']
  },
  {
    title: ['vip.privilege', '多资产特权全覆盖'],
    desc: ['vip.privilege.desc', '一个身份享全部权益']
  }
];

export const GOLDEN_BTN =
  'bg-[#FFD799] text-text-white-to-black text-base px-4 py-3 md:py-2 rounded-xl md:rounded-lg hover:bg-[#FFDFB0]! active:brightness-95 font-medium cursor-pointer';

export const BENEFIT_TITLE =
  'text-[#FFD583] md:text-white group-hover:text-[#FFD583] text-[20px] md:text-lg font-medium md:font-bold text-center';

export const BENEFIT_CARD =
  'group flex flex-col items-center justify-center gap-3 border-b border-line-border-default py-12 px-3 bg-contain bg-center bg-no-repeat hover:border-b-transparent';

export const HERO_BG_CLASS =
  'bg-[image:var(--vip-hero-bg)] md:bg-[image:var(--vip-hero-bg-md)]';

export const PRODUCT_CARD_CLASS =
  'bg-[image:var(--vip-product-card-bg)] bg-no-repeat md:bg-none';

export const HERO_STYLE = {
  '--vip-hero-bg': `url(${basePath}/images/vip/header-bg-h5.png)`,
  '--vip-hero-bg-md': `url(${basePath}/images/vip/header-bg.png)`
} as CSSProperties;

export const PRODUCT_CARD_STYLE = {
  '--vip-product-card-bg': `url(${basePath}/images/vip/card-border.svg)`
} as CSSProperties;

export const FOOTER_STYLE = {
  backgroundImage: `url(${basePath}/images/vip/footer-bg.png)`,
  backgroundSize: '100% 100%',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
} as CSSProperties;
