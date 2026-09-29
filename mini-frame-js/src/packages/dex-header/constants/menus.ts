import { isTest, isTestnet } from '@/utils/host'

export const affiliateDomain = isTest
  ? 'https://affiliates.test.bitrunfinance.com'
  : isTestnet
  ? 'https://affiliates.easicoin.io'
  : 'https://affiliates.easicoin.io'

const isAffiliateDomain = window.location.hostname.includes('affiliates')

export const easicoinDomain = isTest ? 'https://www.test.bitrunfinance.com' : window.location.origin

export const dynamicDomain = isAffiliateDomain ? easicoinDomain : ''
