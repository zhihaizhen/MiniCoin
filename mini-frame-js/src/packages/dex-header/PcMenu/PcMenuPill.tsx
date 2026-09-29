import React from 'react'

export interface PcMenuPillProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
}

/**
 * PC 顶部菜单通用“胶囊”容器：
 * - 统一 className（itemContainer / itemContainerActive）
 * - 统一承载 icon / 文案 / 箭头
 * - 业务组件只关注数据与交互逻辑
 */
export const PcMenuPill = React.forwardRef<HTMLDivElement, PcMenuPillProps>(
  ({ active, leadingIcon, trailingIcon, className, children, ...rest }, ref) => {
    const cn = ['itemContainer', active ? 'itemContainerActive' : '', className]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={cn} {...rest}>
        {leadingIcon}
        {children}
        {trailingIcon}
      </div>
    )
  }
)

PcMenuPill.displayName = 'PcMenuPill'


