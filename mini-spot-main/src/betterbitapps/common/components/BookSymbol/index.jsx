// import pushEvent from '@region/by-gtm';
import { storage } from 'by-storage';
import SymbolTab from 'common/components/BookSymbol/SymbolTab';
import SymbolCategory from 'common/components/BookSymbol/SymbolCategory';
import SymbolTable from 'common/components/BookSymbol/SymbolTable';
import SymbolSearch from 'common/components/BookSymbol/SymbolSearch';
import { useBookSymbolConfig } from 'common/hooks/use-book-symbol-config';
import {
  SPOT_SYMBOLS_TAB,
  SPOT_SECTION_CATEGORY_TYPE,
  TAB_LIST,  
} from 'common/packages-biz/global-settings';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import useUserStore from '@/store-hooks/use-user-store';
import { types, useGlobalState } from '@/store';
import './index.less';

const BookSymbol = ({
  defaultActiveTab,
}) => {
  const [globalState, globalDispatch] = useGlobalState();
  const { sectionCategory } = globalState;
  const [searchTxt, setSearchTxt] = useState('');
  const { spotTabList } = useBookSymbolConfig();
  const { loggedIn } = useUserStore();
  const { symbol, currentTheme } = globalState;
  const [activeTab, setActiveTab] = useState(defaultActiveTab);  // 一级tab
  const [activeSectionId, setActiveSectionId] = useState(1);   // 二级分类，默认全部

  const handleTabClick = (e, activeTabType) => {
    e.stopPropagation();
    storage.set(SPOT_SYMBOLS_TAB, activeTabType);
    setActiveTab(activeTabType);
    // pushEvent('click', 'bookSymbol_tab', `table_tab=${activeTabType}`);
  };

  const handleCategoryClick = (e, categorySectionId) => {
    e.stopPropagation();
    storage.set(SPOT_SECTION_CATEGORY_TYPE, categorySectionId);
    setActiveSectionId(categorySectionId);
  };

  // const showTabList = useMemo(() => {
  //   const newlist = TAB_LIST;
  //   Object.keys(allSpotTokenConfig).forEach(token => {
  //     newlist.push({
  //       type: token,
  //       translationTxt: token, 
  //     })
  //   });  
  //   return newlist;
  // }, [allSpotTokenConfig]);

  const categoryList = useMemo(() => {
    const list = sectionCategory.filter(item => item.symbolCategory === 'spot').map(item => ({
      showWeight: item.showWeight,
      sectionId: item.sectionId,
      translationTxt: item.languageCode,
    }));
    const sortList = list.sort((a, b) => b.showWeight - a.showWeight);
    sortList.unshift({
      showWeight: 100000,
      sectionId: 1,
      translationTxt: 'all',
    });
    return sortList;
  }, [sectionCategory]);

  return (
    <div className="symbolist-wrap">
      <SymbolSearch value={searchTxt} onChange={setSearchTxt} />
      {/* tab */}
      <SymbolTab
        disable={!!searchTxt}
        activeTab={activeTab}
        tabList={TAB_LIST}
        handleTabClick={handleTabClick}
      />
      {/* 二级分类 */}
      <SymbolCategory
        activeSectionId={activeSectionId}
        categoryList={categoryList}
        handleCategoryClick={handleCategoryClick}
      />
      {/* table */}
      <SymbolTable
        searchTxt={searchTxt}
        data={spotTabList}
        isLogin={loggedIn}
        theme={currentTheme}
        activeTab={activeTab}
        activeSectionId={activeSectionId}
      />
    </div>
  );
};

BookSymbol.defaultProps = {
  defaultActiveTab: 'all',
};
BookSymbol.propTypes = {
  defaultActiveTab: PropTypes.string,
};

export default BookSymbol;
