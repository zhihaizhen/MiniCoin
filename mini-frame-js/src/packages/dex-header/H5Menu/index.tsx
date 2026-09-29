import React, { useState } from 'react'
import styles from './index.module.less'

import type { TFunc } from '@/types/dex-header'

export type H5MenuItem = {
  title: string
  label: string
  target?: string
  href?: string
  hotIcon?: boolean
  arrowIcon?: boolean
  isToggle?: boolean
  trailingIcon?: string
  children?: Array<{ title: string; href: string; ns?: string; trailingIcon?: string }>
}

type H5MoreMenuItem = {
  key: string
  href: string
  text: string
  tag?: string
  badge?: string
}

export function H5Menu(props: {
  items: H5MenuItem[]
  curPageName: string
  t: TFunc
  moreAcademyItems?: H5MoreMenuItem[]
  moreInstitutionItems?: H5MoreMenuItem[]
}) {
  const { items, curPageName, t, moreAcademyItems = [], moreInstitutionItems = [] } = props

  // 本地状态：当前打开的菜单 title（互斥，同时只能打开一个）
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const handleToggleByTitle = (title: string) => {
    setOpenMenu((prev) => (prev === title ? null : title))
  }

  const isOpen = (title: string) => openMenu === title

  const TOGGLE_TITLES = new Set(['buy-crypto', 'contractTrade', 'more', 'activities', 'earn'])
  const isToggle = (title: string, flag?: boolean) =>
    typeof flag === 'boolean' ? flag : TOGGLE_TITLES.has(title)

  return (
    <div className={styles.h5MenuWrapper}>
      {items.map((item) => {
        const open = isOpen(item.title)
        const toggle = isToggle(item.title, item.isToggle)
        const active = curPageName === item.label

        const className = [
          toggle ? styles.h5MenuItemToggle : styles.h5MenuItem,
          active ? styles.h5MenuItemActive : ''
        ]
          .filter(Boolean)
          .join(' ')

        // 渲染菜单项内容
        const renderTitle = () => {
          const titleClassName = [toggle ? styles.h5MenuItemTitle : '', open ? styles.open : '']
            .filter(Boolean)
            .join(' ')

          return (
            <div
              className={titleClassName}
              onClick={
                toggle
                  ? (e) => {
                      e.stopPropagation()
                      handleToggleByTitle(item.title)
                    }
                  : undefined
              }
            >
              <span>{t(item.title)}</span>
              {toggle && (
                <svg
                  className={styles.arrowIcon}
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.0833 4.9585L6.99999 10.2085L2.91666 4.9585H11.0833Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>
          )
        }

        // 渲染子菜单
        const renderSubMenu = () => {
          if (!open) return null

          const renderMoreStaticSection = (title: string, sectionItems: H5MoreMenuItem[]) => {
            if (!sectionItems.length) return null

            return (
              <>
                <div className={styles.h5SectionTitle}>{title}</div>
                <ul className={styles.h5SubMenu}>
                  {sectionItems.map((sub) => (
                    <li key={sub.key}>
                      <a
                        href={sub.href}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                      >
                        <span>{sub.text}</span>
                        {sub.tag && <span className={styles.h5MenuItemTag}>{sub.tag}</span>}
                        {sub.badge && <span className={styles.h5MenuItemTag}>{sub.badge}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )
          }

          // “更多”：按设计稿拆成多段（合约数据 / 学院 / 机构）
          if (item.title === 'more') {
            return (
              <div className={styles.h5MorePanel}>
                <div className={styles.h5SectionTitle}>{t('futures-data')}</div>
                {item.children?.length ? (
                  <ul className={styles.h5SubMenu}>
                    {item.children.map((sub, idx) => (
                      <li key={`${sub.title}-${idx}`}>
                        <a
                          href={sub.href}
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className={styles.h5SubMenuItem}
                        >
                          <span>{t(sub.title, sub.ns)}</span>
                          {sub.trailingIcon && (
                            <img src={sub.trailingIcon} alt="" className={styles.trailingIcon} />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {renderMoreStaticSection(String(t('academy') || ''), moreAcademyItems)}
                {renderMoreStaticSection(String(t('institutions') || '机构'), moreInstitutionItems)}
              </div>
            )
          }

          // 其它下拉（合约交易/活动）：保持原样
          return item.children?.length ? (
            <ul className={styles.h5SubMenu}>
              {item.children.map((sub, idx) => (
                <li key={`${sub.title}-${idx}`}>
                  <a
                    href={sub.href}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <span>{t(sub.title, sub.ns)}</span>
                    {sub.trailingIcon && (
                      <img src={sub.trailingIcon} alt="" className={styles.trailingIcon} />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          ) : null
        }

        if (toggle) {
          return (
            <div key={item.title} className={className}>
              {renderTitle()}
              {renderSubMenu()}
            </div>
          )
        }

        return (
          <a
            key={item.title}
            className={`${className} ${styles.h5MenuItemWithIcon}`}
            href={item.href}
            target={item.target}
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <span>{t(item.title)}</span>
            {item.trailingIcon && <img src={item.trailingIcon} alt="" className={styles.trailingIcon} />}
          </a>
        )
      })}
    </div>
  )
}
