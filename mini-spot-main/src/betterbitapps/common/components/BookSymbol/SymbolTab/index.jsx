import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.module.less';

const BookSymbolTab = (props) => {
  const {
    disable,
    activeTab,
    tabList,
    handleTabClick,
  } = props;
  const [t] = useTranslation();

  return (
    <div
      className={classNames('book-symbol-tab__bg', {
        'book-symbol-tab__bg--disable': disable,
      })}
    >
      <For each="tabItem" of={tabList} index="inx">
        <div
          className={classNames('book-symbol-tab__box f-12 nowrap', {
            'book-symbol-tab__box-active': tabItem.type === activeTab,
          })}
          onClick={(e) => handleTabClick(e, tabItem.type)}
          key={inx}
        >
          <div className="book-symbol-tab__inner">
            <span>{t(tabItem.translationTxt)}</span>
          </div>
        </div>
      </For>
    </div>
  );
};

BookSymbolTab.defaultProps = {
  disable: false,
  activeTab: undefined,
  tabList: [],
  handleTabClick: undefined,
};

BookSymbolTab.propTypes = {
  disable: PropTypes.bool,
  activeTab: PropTypes.string,
  tabList: PropTypes.array,
  handleTabClick: PropTypes.func,
};

export default BookSymbolTab;
