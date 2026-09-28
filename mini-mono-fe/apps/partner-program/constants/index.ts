import { isTest } from '@better-bit-fe/base-utils';

export const partnerManagementUrl = isTest
  ? 'https://test-affiliate.bitrunfinance.com/'
  : 'https://partner.easicoin.io';

export const returnPageDomain = isTest
  ? 'https://affiliates.test.bitrunfinance.com'
  : 'https://affiliates.easicoin.io';

export const partnerRegisterUrl = 'https://forms.gle/ctD78M5ZJxuq1qHq9';

export const easicoinDomain = isTest
  ? 'https://www.test.bitrunfinance.com'
  : 'https://www.easicoin.io';
