import React, { useState } from 'react'
import { LangIcon } from './icons/LangIcon'
import { LangModal } from './LangModal'

import type { LangOption, TFunc } from '@/types/dex-header'

export type PcLangDropdownProps = {
  triggerClassName: string
  iconClassName: string
  langs: LangOption[]
  activeKey: string
  onSelect: (key: string) => void
  t: TFunc
  offset?: number
}

export function PcLangDropdown(props: PcLangDropdownProps) {
  const { triggerClassName, iconClassName, langs, activeKey, onSelect, t } = props
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={triggerClassName} onClick={() => setOpen(true)}>
        <LangIcon className={iconClassName} />
      </div>
      <LangModal
        open={open}
        onClose={() => setOpen(false)}
        langs={langs}
        activeKey={activeKey}
        onSelect={onSelect}
        t={t}
      />
    </>
  )
}
