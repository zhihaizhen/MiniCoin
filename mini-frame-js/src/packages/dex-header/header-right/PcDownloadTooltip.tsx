import React from 'react'
import { DownloadIcon } from './icons/DownloadIcon'
import { DEBUG_KEEP_DOWNLOAD_TOOLTIP_OPEN } from '../PcMenu/constants'
import { HeaderRightHoverPopover } from './HeaderRightHoverPopover'
import { getHeaderThemeClassName } from '../utils/theme'

import type { TFunc } from '@/types/dex-header'

export type PcDownloadTooltipProps = {
  triggerClassName: string
  iconClassName: string
  t: TFunc
  qrcodeDataUrl: string
  qrcodeLogoUrl: string
  moreClientsHref: string
  onPreload?: () => void
  offset?: number
}

export function PcDownloadTooltip(props: PcDownloadTooltipProps) {
  const {
    triggerClassName,
    iconClassName,
    t,
    qrcodeDataUrl,
    qrcodeLogoUrl,
    moreClientsHref,
    onPreload,
    offset = 12
  } = props

  return (
    <HeaderRightHoverPopover
      triggerClassName={triggerClassName}
      trigger={<DownloadIcon className={iconClassName} />}
      popperClassName={`qrcodeDrop ${getHeaderThemeClassName()}`}
      offset={offset}
      debugKeepOpen={DEBUG_KEEP_DOWNLOAD_TOOLTIP_OPEN}
      onBeforeOpen={onPreload}
    >
      {({ close }) => (
        <div
          className="qrcode-content-wrapper"
          onClickCapture={(e) => {
            const target = e.target as Element | null
            if (!target) return
            // "More clients" 是跳转链接：点击后关闭 tooltip，避免跳转前残留打开态
            if (target.closest('a')) close()
          }}
        >
          <div className="text">{t('scanQrcode')}</div>
          <div className="qrcode-wrapper">
            {qrcodeDataUrl ? (
              <img
                src={qrcodeDataUrl}
                width={140}
                height={140}
                alt="Download QR Code"
                className="qrcode-image"
              />
            ) : (
              <div className="qrcode-loading">加载中...</div>
            )}
            {qrcodeDataUrl ? <img src={qrcodeLogoUrl} className="qrcode-logo" alt="Logo" /> : null}
          </div>
          <div className="btn-wrapper">
            <a href={moreClientsHref}>{t('moreClients')}</a>
          </div>
        </div>
      )}
    </HeaderRightHoverPopover>
  )
}

