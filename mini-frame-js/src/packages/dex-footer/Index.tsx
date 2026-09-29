import React from 'react'
import { createRoot } from 'react-dom/client'
import { LargeFooter } from './Large'
import { SmallFooter } from './Small'

export type DexFooterType = 'large' | 'small'

export interface DexFooterProps {
  type?: DexFooterType
  showDownloadBanner?: boolean
}

export function DexFooterIndex({ type = 'large', showDownloadBanner }: DexFooterProps) {
  return type === 'small' ? <SmallFooter /> : <LargeFooter showDownloadBanner={showDownloadBanner} />
}

export function mountDexFooter(container: HTMLElement, props?: DexFooterProps) {
  const root = createRoot(container)
  const initialType = props?.type ?? 'large'

  root.render(<DexFooterIndex type={initialType} />)

  return {
    unmount: () => root.unmount(),
    state: {
      type: initialType
    }
  }
}

export default {
  mount: mountDexFooter,
  state: () => ({ type: 'large' as DexFooterType })
}
