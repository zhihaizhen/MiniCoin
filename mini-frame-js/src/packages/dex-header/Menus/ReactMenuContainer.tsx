import React, { useMemo } from 'react'
import { useMenuData } from '../hooks/useMenuData'
import { H5Menu } from '../H5Menu'
import { PcMenu } from '../PcMenu/PcMenu'
import { useIsMobile } from '../hooks/useIsMobile'
import { useDexUserSnapshot } from '../hooks/useDexUser'
import searchIcon from '../assets/searchIcon.svg?url'
import './Menu.less'

import type { TFunc } from '@/types/dex-header'

export interface ReactMenuContainerProps {
    language: string
    t: TFunc
}

export function ReactMenuContainer({ language, t }: ReactMenuContainerProps) {
  const { user } = useDexUserSnapshot()
    const supportBlock = user?.supportBlock

    const {
        curPageName,
        pcBuyCryptoItems,
        pcMoreContractDataItems,
        pcMoreInstitutionItems,
        pcMoreAcademyItems,
        pcMoreHelpItems,
        pcActivitiesItems,
        pcActivitiesHotItems,
        pcSpotTradeItems,
        pcEarnItems,
        pcContractEntries,
        pcContractSymbols,
        h5MenuItems,
        pcMenuItems
  } = useMenuData({ language, t, supportBlock })

    const isMobile = useIsMobile()

    const pcDropdowns = useMemo(() => {

        return {
            buyCrypto: {
                label: t('buyCoin'),
                active: curPageName === 'fiat',
                items: pcBuyCryptoItems,
                variant: 'buyCrypto' as const
            },
            contractTrade: {
                label: t('contract'),
                active: curPageName === 'trade',
                entries: pcContractEntries,
                symbols: pcContractSymbols,
                searchIconUrl: searchIcon,
                searchPlaceholder: t('searchIconPlaceholder'),
                tradeSectionTitle: t('spotTrade'),
                exploreSectionTitle: t('contractSectionExplore')
            },
            spotTrade: {
                label: t('spotTrade'),
                active: curPageName === 'spotTrade',
                items: pcSpotTradeItems,
                variant: 'spotTrade' as const
            },
            earn: {
                label: t('earn'),
                active: curPageName === 'earn',
                items: pcEarnItems
            },
            activities: {
                label: t('activities'),
                active: curPageName === 'activities',
                variant: 'activities' as const,
                leftTitle: t('exclusiveActivities'),
                items: pcActivitiesItems,
                rightTitle2: t('hotActivities'),
                rightItems2: pcActivitiesHotItems
            },
            more: {
                label: t('more'),
                active: curPageName === 'futures-data' || curPageName === 'more',
                variant: 'more' as const,
                leftTitle: t('futures-data'),
                items: pcMoreContractDataItems,
                rightTitle: t('academy'),
                rightItems: pcMoreAcademyItems,
                rightTitle2: t('institutions'),
                rightItems2: pcMoreInstitutionItems,
                thirdTitle: t('help'),
                thirdItems: pcMoreHelpItems
            }
        }
    }, [
        curPageName,
        pcBuyCryptoItems,
        pcActivitiesItems,
        pcActivitiesHotItems,
        pcSpotTradeItems,
        pcEarnItems,
        pcContractEntries,
        pcContractSymbols,
        pcMoreContractDataItems,
        pcMoreAcademyItems,
        pcMoreInstitutionItems,
        pcMoreHelpItems,
        t,
        language
    ])

    return (
        <div className="menuWrapper">
            <div className="menu">
                {isMobile ? (
                    <H5Menu
                        items={h5MenuItems}
                        curPageName={curPageName}
                        t={t}
                        moreAcademyItems={pcMoreAcademyItems}
                        moreInstitutionItems={pcMoreInstitutionItems}
                    />
                ) : (
                    <PcMenu items={pcMenuItems} dropdowns={pcDropdowns} hideTradfiEntry={supportBlock === false}/>
                )}
            </div>
        </div>
    )
}
