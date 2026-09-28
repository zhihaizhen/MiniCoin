import React from 'react'
import { PcContractTradeDropdown } from './PcContractTradeDropdown'
import { PcSimpleDropdown } from './PcSimpleDropdown'
import { HotIcon, ArrowIcon } from './icons'
import { PcMenuPill } from './PcMenuPill'
import type { PcMenuProps, PcMenuItem } from './types'
import activityVideo from '../assets/activity.webm?url'
import activityVideoEn from '../assets/activity-en.webm?url'
import { getLanguage, useLanguageValue } from '../hooks/useLanguage'

// 判断是否为下拉菜单项
const DROPDOWN_ITEMS = new Set([
  'buy-crypto',
  'contractTrade',
  'more',
  'activities',
  'spotTrade',
  'earn'
])
const isDropdownItem = (title: string) => DROPDOWN_ITEMS.has(title)

export function PcMenu(props: PcMenuProps) {
  const { items, dropdowns, hideTradfiEntry } = props
  const language = useLanguageValue()
  const videoSrc = language.startsWith('zh') ? activityVideo : activityVideoEn

  const handleBannerClick = () => {
    window.open(`/${getLanguage()}/activity-center/points-redeem`, '_self')
  }

  const renderMenuItem = (item: PcMenuItem) => {
    return (
      <React.Fragment key={item.title}>
        <a className="pcMenuItem" href={item.href} target={item.target}>
          {/* 买币下拉 */}
          {item.title === 'buy-crypto' && (
            <div className="header-nav-contract-container">
              <PcSimpleDropdown {...dropdowns.buyCrypto} align="center" />
            </div>
          )}

          {/* 合约交易下拉 */}
          {item.title === 'contractTrade' && (
            <div className="header-nav-contract-container">
              <PcContractTradeDropdown {...dropdowns.contractTrade} align="center-left" />
            </div>
          )}

          {/* More 下拉（左侧为合约数据） */}
          {item.title === 'more' && (
            <div className="header-nav-contract-container">
              <PcSimpleDropdown {...dropdowns.more} align="center" />
            </div>
          )}

          {/* Activities 下拉 */}
          {item.title === 'activities' && (
            <div className="header-nav-contract-container">
              <PcSimpleDropdown
                {...dropdowns.activities}
                variant="activities"
                align="center-left"
                leadingIcon={item.hotIcon ? <HotIcon className="hoticon" /> : undefined}
              />
            </div>
          )}

          {/* 现货交易下拉 */}
          {item.title === 'spotTrade' && (
            <div className="header-nav-contract-container">
              <PcSimpleDropdown {...dropdowns.spotTrade} align="center" />
            </div>
          )}

          {/* Earn 下拉 */}
          {item.title === 'earn' && (
            <div className="header-nav-contract-container">
              <PcSimpleDropdown {...dropdowns.earn} variant="earn" align="center" />
            </div>
          )}

          {/* 普通菜单项 */}
          {!isDropdownItem(item.title) && (
            <PcMenuPill
              active={item.active}
              leadingIcon={item.hotIcon ? <HotIcon className="hoticon" /> : undefined}
            >
              <span>{item.text}</span>
            </PcMenuPill>
          )}

          {/* 箭头图标 */}
          {item.arrowIcon && <ArrowIcon />}
        </a>

        {/* 在"更多"菜单后添加活动视频 */}
        {item.title === 'more' && (
          <div className="activityVideoContainer" onClick={handleBannerClick}>
            <video className="activityVideo" src={videoSrc} autoPlay loop muted playsInline />
          </div>
        )}
      </React.Fragment>
    )
  }

  return <>{items.map(renderMenuItem)}</>
}

// 导出类型
export type { PcMenuItem, PcMenuProps } from './types'
