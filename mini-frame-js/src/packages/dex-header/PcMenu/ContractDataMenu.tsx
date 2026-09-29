import React from 'react'
import type { SimpleDropdownItem } from './types'
import { ChevronRight } from './icons'

type ContractDataMenuProps = {
  title: string
  items: SimpleDropdownItem[]
  onItemClick?: () => void
}

/**
 * 合约数据左侧列表（作为“更多”下拉的子组件）
 * - 只负责渲染标题 + 列表项
 * - 样式复用 futuresData 的 icon/text class（避免在父组件里堆逻辑）
 */
export function ContractDataMenu({ title, items, onItemClick }: ContractDataMenuProps) {
  return (
    <>
      <div className="moreDropdownSectionTitle">{title}</div>
      <ul className="rc-menu rc-menu--popup rc-menu--popup-right-start">
        {items.map((item) => (
          <li key={item.key} className="rc-menu-item">
            <a className="customTitle" href={item.href} onClick={onItemClick}>
              <div className="futuresDataItemContent">
                {item.iconUrl && <img src={item.iconUrl} alt="" className="futuresDataIcon" />}
                <span className="futuresDataText">{item.text}</span>
              </div>
              <i className="rc-icon rc-sub-menu__icon-arrow customArrow" aria-hidden="true">
                <ChevronRight />
              </i>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}


