import React, { useMemo } from 'react'

import { AssetsIcon } from './icons/AssetsIcon'
import walletIconUrl from '../assets/icon/wallet.svg?url'
import fundsIconUrl from '../assets/icon/funds.svg?url'
import spotIconUrl from '../assets/icon/spot.svg?url'
import contractIconUrl from '../assets/icon/order.svg?url'
import earnIconUrl from '../assets/icon/earn-overview.svg?url'
import blockIconUrl from '../assets/icon/tradfi-overview.svg?url'
import strategyIconUrl from '../assets/icon/strategy.svg?url'
import eyeOpenIconUrl from '../assets/icon/eye-open.svg?url'
import eyeCloseIconUrl from '../assets/icon/eye-close.svg?url'
import depositIconUrl from '../assets/icon/deposit.svg?url'
import withdrawIconUrl from '../assets/icon/withdraw.svg?url'
import transferIconUrl from '../assets/icon/transfer.svg?url'

import { DEBUG_KEEP_ASSETS_DROPDOWN_OPEN } from '../PcMenu/constants'
import { HeaderRightHoverPopover } from './HeaderRightHoverPopover'
import { getHeaderThemeClassName } from '../utils/theme'

import type { ReactNode } from 'react'
import type { TFunc } from '@/types/dex-header'

export type AssetShortcutType = 'deposit' | 'withdraw' | 'transfer'
export type AssetAccountType = 'overview' | 'spot' | 'contract' | 'earn' | 'block' | 'strategy' | 'funding'
export type AssetDropdownSelectType = AssetShortcutType | AssetAccountType

export type PcAssetsDropdownItem<T extends string> = {
  key: T
  label: ReactNode
  iconUrl?: string
}

export type PcAssetsDropdownProps = {
  /** 触发器外层（hover-item）class，来自 header.vue 的 css module */
  triggerClassName: string
  /** svg icon class，来自 header.vue 的 css module */
  iconClassName: string
  /** 国际化函数，内部自行获取文案，避免重复透传 */
  t: TFunc

  /** 总资产展示，例如：0.000135 BTC */
  totalAssetText?: ReactNode
  /** 折算资产展示，例如：≈ 57.76 CNY */
  estimateAssetText?: ReactNode
  /** 是否显示资产数值 */
  balanceVisible?: boolean
  /** 点击眼睛图标时触发 */
  onToggleBalanceVisible?: () => void

  /** 选择充值/提现/划转 */
  onShortcutSelect?: (type: AssetShortcutType) => void
  /** 选择账户入口 */
  onAccountSelect?: (type: AssetAccountType) => void
  /** 统一选择回调 */
  onSelect?: (type: AssetDropdownSelectType) => void

  /** 自定义快捷操作；不传时使用设计图默认 3 项 */
  shortcutItems?: PcAssetsDropdownItem<AssetShortcutType>[]
  /** 自定义账户入口；不传时使用设计图默认 6 项 */
  accountItems?: PcAssetsDropdownItem<AssetAccountType>[]
  /** 是否隐藏大宗账户 */
  hideBlockAccount?: boolean

  /** 与原 Popper 对齐的垂直偏移，默认 12 */
  offset?: number
}

const ACCOUNT_ICON_URLS: Record<AssetAccountType, string> = {
  overview: walletIconUrl,
  funding: fundsIconUrl,
  spot: spotIconUrl,
  contract: contractIconUrl,
  earn: earnIconUrl,
  block: blockIconUrl,
  strategy: strategyIconUrl
}

function getText(t: TFunc, key: string, fallback: string) {
  const value = t(key)
  return value && value !== key ? value : fallback
}


function CaretDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 4.5L6 8L9.5 4.5H2.5Z" fill="currentColor" />
    </svg>
  )
}

export function PcAssetsDropdown(props: PcAssetsDropdownProps) {
  const {
    triggerClassName,
    iconClassName,
    t,
    totalAssetText = '-- BTC',
    estimateAssetText = '-- CNY',
    balanceVisible = true,
    onToggleBalanceVisible,
    onShortcutSelect,
    onAccountSelect,
    onSelect,
    shortcutItems,
    accountItems,
    hideBlockAccount,
    offset = 12
  } = props

  const defaultShortcutItems = useMemo<PcAssetsDropdownItem<AssetShortcutType>[]>(
    () => [
      { key: 'deposit', label: getText(t, 'depositBtn', 'Deposit') },
      { key: 'withdraw', label: getText(t, 'withdraw', 'Withdraw') },
      { key: 'transfer', label: getText(t, 'transfer', 'Transfer') }
    ],
    [t]
  )

  const defaultAccountItems = useMemo<PcAssetsDropdownItem<AssetAccountType>[]>(
    () =>
      (
        [
          { key: 'overview', label: getText(t, 'assetsOverview', 'Assets Overview') },
          { key: 'funding', label: getText(t, 'fundingAccount', 'Funding Account') },
          { key: 'spot', label: getText(t, 'spotAccount', 'Spot Account') },
          { key: 'contract', label: getText(t, 'contractAccount', 'Contract Account') },
          { key: 'earn', label: getText(t, 'earnAccount', 'Earn Account') },
          { key: 'block', label: getText(t, 'blockAccount', 'Block Account') },
          { key: 'strategy', label: getText(t, 'strategyAccount', 'Strategy Account') }
        ] as PcAssetsDropdownItem<AssetAccountType>[]
      )
        .filter((item) => !(hideBlockAccount && item.key === 'block'))
        .map((item) => ({
          ...item,
          iconUrl: ACCOUNT_ICON_URLS[item.key]
        })),
    [t, hideBlockAccount]
  )

  const shortcuts = shortcutItems || defaultShortcutItems
  const accounts = accountItems || defaultAccountItems
  const hiddenAmount = '******'

  return (
    <HeaderRightHoverPopover
      triggerClassName={triggerClassName}
      trigger={<AssetsIcon className={iconClassName} />}
      popperClassName={`assetsDrop ${getHeaderThemeClassName()}`}
      offset={offset}
      debugKeepOpen={DEBUG_KEEP_ASSETS_DROPDOWN_OPEN}
    >
      {({ close }) => (
        <div className="assetsDropContent">
          {/* 下个版本要加的内容，暂不删除，等后端接口 */}
          {/*<div className="assetsDropSummary">*/}
          {/*  <button*/}
          {/*    type="button"*/}
          {/*    className="assetsDropSummaryLabel"*/}
          {/*    onClick={(event) => {*/}
          {/*      event.stopPropagation()*/}
          {/*      onToggleBalanceVisible?.()*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <span>{getText(t, 'totalAssetsValue', 'Total Assets Value')}</span>*/}
          {/*    <img src={balanceVisible ? eyeOpenIconUrl : eyeCloseIconUrl} alt="" />*/}
          {/*  </button>*/}

          {/*  <div className="assetsDropAmount">*/}
          {/*    <span>{balanceVisible ? totalAssetText : hiddenAmount}</span>*/}
          {/*    <CaretDownIcon />*/}
          {/*  </div>*/}

          {/*  {estimateAssetText ? (*/}
          {/*    <div className="assetsDropEstimate">*/}
          {/*      {balanceVisible ? estimateAssetText : `≈ ${hiddenAmount}`}*/}
          {/*    </div>*/}
          {/*  ) : null}*/}
          {/*</div>*/}

          {/*<div className="assetsDropShortcuts">*/}
          {/*  {shortcuts.map(({ key, label }) => (*/}
          {/*    <button*/}
          {/*      key={key}*/}
          {/*      type="button"*/}
          {/*      className="assetsDropShortcut"*/}
          {/*      onClick={() => {*/}
          {/*        onShortcutSelect?.(key)*/}
          {/*        onSelect?.(key)*/}
          {/*        close()*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      <span className="assetsDropShortcutIcon">*/}
          {/*        {key === 'deposit' && <img src={depositIconUrl} alt="deposit" />}*/}
          {/*        {key === 'withdraw' && <img src={withdrawIconUrl} alt="withdraw" />}*/}
          {/*        {key === 'transfer' && <img src={transferIconUrl} alt="transfer" />}*/}
          {/*      </span>*/}
          {/*      <span className="assetsDropShortcutText">{label}</span>*/}
          {/*    </button>*/}
          {/*  ))}*/}
          {/*</div>*/}

          <ul className="assetsDropMenu">
            {accounts.map(({ key, label, iconUrl }) => (
              <li
                key={key}
                className="assetsDropMenuItem"
                onClick={() => {
                  onAccountSelect?.(key)
                  onSelect?.(key)
                  close()
                }}
              >
                {iconUrl ? <img className="assetsDropMenuIcon" src={iconUrl} alt="" /> : null}
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </HeaderRightHoverPopover>
  )
}
