import React, { useMemo } from 'react'
import { OrderIcon } from './icons/OrderIcon'
import spotsOrderIconUrl from '../assets/icon/spots.svg?url'
import contractOrderIconUrl from '../assets/icon/order.svg?url'
import quickBuyOrderIconUrl from '../assets/icon/quick-buy-order.svg?url'
import earnOrderIconUrl from '../assets/icon/earn-order.svg?url'
import blockOrderIconUrl from '../assets/icon/block-order.svg?url'
import convertOrderIconUrl from '../assets/icon/convert-order.svg?url'
import loanOrderIconUrl from '../assets/icon/loan-order.svg?url'

import { DEBUG_KEEP_ORDER_DROPDOWN_OPEN } from '../PcMenu/constants'
import { HeaderRightHoverPopover } from './HeaderRightHoverPopover'
import { getHeaderThemeClassName } from '../utils/theme'

import type { OrderType, TFunc } from '@/types/dex-header'

export type PcOrderDropdownProps = {
  /** 触发器外层（hover-item）class，来自 header.vue 的 css module */
  triggerClassName: string
  /** svg icon class（order-icon），来自 header.vue 的 css module */
  iconClassName: string
  /** 国际化函数，内部自行获取文案，避免重复透传 */
  t: TFunc
  /** 选择订单类型 */
  onSelect: (type: OrderType) => void
  /** 与原 Popper 对齐的垂直偏移，默认 12 */
  offset?: number
  /** 是否隐藏大宗交易订单 */
  hideBlockOrder?: boolean
}

const ORDER_ICON_URLS: Record<OrderType, string> = {
  spot: spotsOrderIconUrl,
  contract: contractOrderIconUrl,
  fiat: quickBuyOrderIconUrl,
  earn: earnOrderIconUrl,
  block: blockOrderIconUrl,
  convert: convertOrderIconUrl,
  loan: loanOrderIconUrl
}

export function PcOrderDropdown(props: PcOrderDropdownProps) {
  const { triggerClassName, iconClassName, t, onSelect, offset = 12, hideBlockOrder } = props

  const items = useMemo(
    () =>
      (
        [
          { key: 'spot', label: t('spotOrder') },
          { key: 'contract', label: t('contractOrder') },
          { key: 'block', label: t('blockOrder') },
          { key: 'fiat', label: t('quickBuyOrder') },
          { key: 'earn', label: t('earnOrder') },
          { key: 'convert', label: t('convert-order') },
          { key: 'loan', label: t('loan-borrow-history') },
        ] as const
      )
        .filter((item) => !(hideBlockOrder && item.key === 'block'))
        .map((item) => ({
          ...item,
          iconUrl: ORDER_ICON_URLS[item.key]
        })),
    [t, hideBlockOrder]
  )

  return (
    <HeaderRightHoverPopover
      triggerClassName={triggerClassName}
      trigger={<OrderIcon className={iconClassName} />}
      popperClassName={`orderDrop ${getHeaderThemeClassName()}`}
      offset={offset}
      debugKeepOpen={DEBUG_KEEP_ORDER_DROPDOWN_OPEN}
    >
      {({ close }) => (
        <ul className="rc-dropdown-menu">
          {items.map(({ key, label, iconUrl }) => (
            <li
              key={key}
              className="rc-dropdown-menu__item"
              onClick={() => {
                onSelect(key)
                close()
              }}
            >
              <div className="orderItem">
                <img className="orderIcon" src={iconUrl} alt="" />
                <span>{label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </HeaderRightHoverPopover>
  )
}
