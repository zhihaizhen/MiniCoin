import { useState, useEffect, useMemo } from 'react'
import SymbolConfig from '@region-lib/symbol-fetch'
import { isMobile } from '@region-lib/helper'
import { dynamicDomain, easicoinDomain } from '../constants/menus'
import {
  getMenuConfig,
  MORE_INSTITUTION_ITEMS,
  MORE_ACADEMY_ITEMS,
  MORE_HELP_ITEMS,
  HELP_CENTER_HREF,
  ANNOUNCEMENT_BASE_HREF,
  type MenuItemConfig,
  type MenuChildConfig
} from '../config/menuConfig'

import type { TFunc } from '@/types/dex-header'

const TOGGLE_MENU_TITLES = new Set(['buy-crypto', 'contractTrade', 'more', 'activities', 'earn'])

const PAGE_ROUTES: Array<{ test: string | RegExp; name: string }> = [
  { test: /\/(fiat|buy-crypto|assets\/deposit)/, name: 'fiat' },
  { test: /\/[a-z]{2}-[A-Z]{2}\/trade\//, name: 'trade' },
  { test: 'earn', name: 'earn' },
  { test: 'copy-trading', name: 'copy-trading' },
  { test: /\/[a-z]{2}-[A-Z]{2}\/spot\//, name: 'spotTrade' },
  { test: 'trading-data', name: 'futures-data' },
  { test: 'markets', name: 'markets' },
  { test: /(rewards-hub|deposit-cashback|lottery|referral|collect-phrase|sign-in|points-redeem)/, name: 'activities' }
]

function detectPageName(): string | null {
  if (typeof window === 'undefined') return null
  const pathname = window.location.pathname
  for (const route of PAGE_ROUTES) {
    if (typeof route.test === 'string' ? pathname.includes(route.test) : route.test.test(pathname)) {
      return route.name
    }
  }
  return null
}

function getSymbolUrl(name: string, style: 'dark' | 'light' = 'dark') {
  if (!name) return ''
  const coin = name.replace(/[/]?USD(T)?$/i, '')
  const isLocalhost =
    typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
  const base = isLocalhost ? easicoinDomain : dynamicDomain
  return `${base}/icon/${style}/${coin?.toLowerCase()}.png`
}

function buildMenuItems(
  menus: MenuItemConfig[],
  menuTitle: string,
  language: string,
  t: TFunc,
  filter?: (sub: MenuChildConfig) => boolean
) {
  const menu = menus.find((m) => m.title === menuTitle)
  let children = menu?.childrenMenu || []
  if (filter) children = children.filter(filter)
  return children.map((sub) => {
    return {
      key: sub.title,
      href: `${dynamicDomain}/${language}${sub.hrefLink}`,
      iconUrl: sub.icon,
      text: t(sub.title),
      desc: t(`${sub.title}-desc`),
      badge: sub.badge,
      tag: sub.tag,
      trailingIconUrl: sub.trailingIcon,
      trailingIconStyle: sub.trailingIconStyle
    }
  })
}

function buildStaticItems(items: MenuChildConfig[], language: string, t: TFunc) {
  return items.map((sub) => {
    let href: string
    if (sub.title === 'helpCenter') {
      href = HELP_CENTER_HREF
    } else if (sub.title === 'announcement') {
      href = `${ANNOUNCEMENT_BASE_HREF}${sub.hrefLink}`
    } else {
      href = `${dynamicDomain}/${language}${sub.hrefLink}`
    }
    return {
      key: sub.title,
      href,
      iconUrl: sub.icon,
      text: sub.title === 'vip' ? 'VIP' : sub.title === 'api' ? 'API' : t(sub.title),
      desc: t(`${sub.title}-desc`),
      badge: sub.badge,
      tag: sub.tag
    }
  })
}

export interface UseMenuDataProps {
  language: string
  t: TFunc
  supportBlock?: boolean
}

export function useMenuData({ language, t, supportBlock }: UseMenuDataProps) {
  const [linearPerpetualList, setLinearPerpetualList] = useState<any[]>([])
  const [curPageName, setCurPageName] = useState<string | null>(null)
  const menus = useMemo<MenuItemConfig[]>(() => getMenuConfig(language), [language])

  useEffect(() => {
    const symbolConfig = SymbolConfig.getInstance()
    const getSymbolList = async () => {
      try {
        const res = await symbolConfig.fetchSymbolList()
        const { originData } = res
        const all = [
          ...originData.LinearPerpetual,
          ...originData.StockRwaPerpetual,
          ...originData.MetalRwaPerpetual
        ]
        const seen = new Map()
        all.forEach((s) => { if (!seen.has(s.symbolName)) seen.set(s.symbolName, s) })
        setLinearPerpetualList(Array.from(seen.values()))
      } catch (error) {
        console.error('Failed to fetch symbol list:', error)
      }
    }
    getSymbolList()
  }, [])

  useEffect(() => { setCurPageName(detectPageName()) }, [])

  const filteredMenus = useMemo(() => menus.filter((item) => item.isShow), [menus])

  const pcMoreContractDataItems = useMemo(
    () => buildMenuItems(menus, 'more', language, t),
    [menus, language, t]
  )

  const pcMoreInstitutionItems = useMemo(
    () => buildStaticItems(MORE_INSTITUTION_ITEMS, language, t),
    [language, t]
  )

  const pcMoreAcademyItems = useMemo(
    () => buildStaticItems(MORE_ACADEMY_ITEMS, language, t),
    [language, t]
  )

  const pcMoreHelpItems = useMemo(
    () => buildStaticItems(MORE_HELP_ITEMS, language, t),
    [language, t]
  )

  const pcActivitiesItems = useMemo(
    () => buildMenuItems(filteredMenus, 'activities', language, t, (s) => s.activityGroup === 'exclusive'),
    [filteredMenus, language, t]
  )

  const pcActivitiesHotItems = useMemo(
    () => buildMenuItems(filteredMenus, 'activities', language, t, (s) => s.activityGroup !== 'exclusive'),
    [filteredMenus, language, t]
  )

  const pcSpotTradeItems = useMemo(
    () => buildMenuItems(filteredMenus, 'spotTrade', language, t),
    [filteredMenus, language, t]
  )

  const pcBuyCryptoItems = useMemo(
    () => buildMenuItems(filteredMenus, 'buy-crypto', language, t),
    [filteredMenus, language, t]
  )

  const pcEarnItems = useMemo(
    () => buildMenuItems(filteredMenus, 'earn', language, t),
    [filteredMenus, language, t]
  )

  const pcContractEntries = useMemo(() => {
    const contractTrade = filteredMenus.find((m) => m.title === 'contractTrade')
    let children = contractTrade?.childrenMenu || []
    if (supportBlock === false) {
      children = children.filter(
        (sub) => sub.title !== 'tradfiTradeTitle' && sub.title !== 'tradfiOverviewTitle'
      )
    }
    const keyMap: Record<string, string> = {
      linearPerpetualTitle: 'linearPerpetualList',
      stockTradeTitle: 'stockTrade',
      demoTradeTitle: 'demoTrade',
      tradfiTradeTitle: 'tradfiTrade',
      tradfiOverviewTitle: 'tradfiOverview'
    }
    return children.map((sub) => ({
      key: (keyMap[sub.title] ?? sub.title) as 'linearPerpetualList' | 'stockTrade' | 'demoTrade' | 'tradfiTrade' | 'tradfiOverview',
      href: `${dynamicDomain}/${language}${sub.hrefLink}`,
      iconUrl: sub.icon || '',
      title: t(sub.title),
      desc: t(`${sub.title.replace('Title', '')}-desc`),
      trailingIconUrl: sub.trailingIcon,
      badge: sub.badge,
      section: sub.contractGroup
    }))
  }, [filteredMenus, language, t, supportBlock])

  const pcContractSymbols = useMemo(() => {
    return (linearPerpetualList || [])
      .filter((s: any) => Boolean(s?.symbolName))
      .map((s: any) => ({
        symbolName: s.symbolName,
        href: `${dynamicDomain}/${language}/trade/usdt/${s.symbolName}`,
        iconUrl: getSymbolUrl(s.symbolName)
      }))
  }, [linearPerpetualList, language])

  const h5MenuItems = useMemo(() => {
    return filteredMenus.map((item) => {
      const isToggle = TOGGLE_MENU_TITLES.has(item.title)
      const href =
        item.label === 'docs'
          ? `${isMobile() ? item.h5HrefLink : item.hrefLink}`
          : `${dynamicDomain}/${language}${isMobile() ? item.h5HrefLink : item.hrefLink}`

      let childrenMenu = item.childrenMenu
      if (supportBlock === false && item.title === 'contractTrade') {
        childrenMenu = childrenMenu?.filter(
          (sub) => sub.title !== 'tradfiTradeTitle' && sub.title !== 'tradfiOverviewTitle'
        )
      }

      const children =
        isToggle && Array.isArray(childrenMenu)
          ? childrenMenu.map((sub) => ({
              title: sub.title,
              href: `${dynamicDomain}/${language}${sub.h5HrefLink}`,
              ns: item.title === 'contractTrade' ? 'global-widget' : undefined,
              trailingIcon: sub.trailingIcon
            }))
          : undefined

      return {
        title: item.title,
        label: item.label,
        target: item.target,
        href,
        hotIcon: !!item.hotIcon,
        arrowIcon: !!item.arrowIcon,
        isToggle,
        trailingIcon: item.trailingIcon,
        children
      }
    })
  }, [filteredMenus, language, t, supportBlock])

  const pcMenuItems = useMemo(() => {
    return filteredMenus.map((item) => {
      const href =
        item.label === 'docs' ? `${item.hrefLink}` : `${dynamicDomain}/${language}${item.hrefLink}`
      return {
        title: item.title,
        label: item.label,
        text: t(item.title),
        href,
        target: item.target,
        active:
          item.label === 'more'
            ? curPageName === 'futures-data' || curPageName === 'more'
            : curPageName === item.label,
        hotIcon: !!item.hotIcon,
        arrowIcon: !!item.arrowIcon
      }
    })
  }, [filteredMenus, language, t, curPageName])

  return {
    curPageName,
    supportBlock,
    pcBuyCryptoItems,
    pcMoreContractDataItems,
    pcMoreInstitutionItems,
    pcMoreAcademyItems,
    pcMoreHelpItems,
    pcActivitiesItems,
    pcActivitiesHotItems,
    pcSpotTradeItems,
    pcEarnItems,
    pcContractEntries,
    pcContractSymbols,
    h5MenuItems,
    pcMenuItems
  }
}
