// ============ 共享类型 ============

import type { CSSProperties, ReactNode } from 'react'
import type { DropdownAlign } from '../hooks/useDropdownPosition'

/** 元素位置矩形 */
export type Rect = {
  left: number
  top: number
  width: number
  height: number
}

// ============ 菜单项类型 ============

export type PcMenuItem = {
  title: string
  label: string
  text: string
  href: string
  target?: string
  active?: boolean
  hotIcon?: boolean
  arrowIcon?: boolean
}

// ============ 合约交易下拉类型 ============

export type ContractMenuEntry = {
  key: 'linearPerpetualList' | 'stockTrade' | 'demoTrade' | 'tradfiTrade' | 'tradfiOverview'
  href: string
  iconUrl: string
  title: string
  desc: string
  trailingIconUrl?: string
  badge?: string
  section?: 'trade' | 'explore'
}

export type ContractSymbol = {
  symbolName: string
  href: string
  iconUrl: string
}

export interface ContractTradeConfig {
  label: string
  active?: boolean
  entries: ContractMenuEntry[]
  symbols: ContractSymbol[]
  searchIconUrl: string
  searchPlaceholder: string
  onOpenChange?: (open: boolean) => void
}

export interface PcContractTradeDropdownProps {
  label: string
  active?: boolean
  entries: ContractMenuEntry[]
  symbols: ContractSymbol[]
  searchIconUrl: string
  searchPlaceholder: string
  /** 交易分区标题（默认"交易"） */
  tradeSectionTitle?: string
  /** 探索分区标题（默认"探索"） */
  exploreSectionTitle?: string
  align?: DropdownAlign
  onOpenChange?: (open: boolean) => void
}

// ============ 简单下拉类型 ============

export type SimpleDropdownItem = {
  key: string
  href: string
  iconUrl?: string
  text: string
  desc?: string
  badge?: string
  tag?: string
  /** title 后的装饰图标（如火焰） */
  trailingIconUrl?: string
  /** 覆盖 trailingIcon 的尺寸样式 */
  trailingIconStyle?: CSSProperties
}

export type MoreInstitutionItem = {
  key: string
  href: string
  iconUrl?: string
  text: string
  badge?: string
  tag?: string
  target?: string
}

export interface SimpleDropdownConfig {
  label: string
  active?: boolean
  items: SimpleDropdownItem[]
  onOpenChange?: (open: boolean) => void
}

export interface PcMenuDropdowns {
  buyCrypto: PcSimpleDropdownProps
  contractTrade: PcContractTradeDropdownProps
  spotTrade: PcSimpleDropdownProps
  /** legacy: 原"合约数据"一级下拉（已并入 more），保留为可选避免破坏旧调用方 */
  futuresData?: PcSimpleDropdownProps
  activities: PcSimpleDropdownProps
  more: PcSimpleDropdownProps
  earn: PcEarnDropdownProps
}

export type EarnDropdownItem = {
  key: string
  href: string
  iconUrl?: string
  text: string
  desc: string
  tag?: string
}

export interface PcEarnDropdownProps {
  label: string
  active?: boolean
  items: EarnDropdownItem[]
  onOpenChange?: (open: boolean) => void
}

export interface PcSimpleDropdownProps {
  label: string
  active?: boolean
  items: SimpleDropdownItem[]
  variant?: 'futuresData' | 'activities' | 'more' | 'spotTrade' | 'buyCrypto' | 'earn'
  /** more/activities 下拉左侧标题 */
  leftTitle?: string
  /** more 下拉第二列顶部标题（学院） */
  rightTitle?: string
  /** more 下拉第二列顶部菜单项 */
  rightItems?: SimpleDropdownItem[]
  /** 下拉第二列标题（活动：热门活动；更多：机构） */
  rightTitle2?: string
  /** 下拉第二列菜单项 */
  rightItems2?: SimpleDropdownItem[]
  /** 下拉第三列标题（更多：帮助） */
  thirdTitle?: string
  /** 下拉第三列菜单项 */
  thirdItems?: SimpleDropdownItem[]
  /** 触发器左侧前置 icon（例如活动的 hot icon），需要包含在 hover 胶囊内 */
  leadingIcon?: ReactNode
  align?: DropdownAlign
  onOpenChange?: (open: boolean) => void
}

// ============ 主菜单 Props ============

export interface PcMenuProps {
  items: PcMenuItem[]
  dropdowns: PcMenuDropdowns
  hideTradfiEntry?: boolean
}
