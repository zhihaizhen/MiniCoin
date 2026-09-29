// @ts-ignore
import { Input } from 'antd';
import PropTypes from 'prop-types';
import { ReactComponent as SearchSvg } from 'common/assets/images/search.svg';
import { useTranslation } from 'react-i18next';
import React, { createRef, forwardRef, useImperativeHandle, useState, useMemo, useEffect } from 'react';
import cls from 'classnames';
import { ReactComponent as ArrowUpSvg } from 'common/assets/images/arrow-up.svg';
import { ReactComponent as CheckSvg } from 'common/assets/images/check.svg';
import { useGlobalState } from '@/store';
import Style from './index.module.less';

const SymbolFilter = forwardRef(({ type, filterType, showCurSymbol, setShowCurSymbol, autoUncheck,
  setAutoUncheck }, ref) => {
  const [globalState, globalDispatch] = useGlobalState();
  const { symbol, symbolAlias, allSpotTokenConfig,walletCoin } = globalState;

  const [t] = useTranslation();
  const [filterValue, setFilterValue] = useState({
    value: '',
    label: 'all'
  }); // 过滤币种，默认是全部
  const [searchVal, setSearchVal] = useState();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showSymbol, setShowSymbol] = useState([]); // dropdown里的symbol列表

  useImperativeHandle(ref, () => ({
    handleResetFilter,
    filterValue,
    handleCloseDropDown,
  }));

  const symbolAll = useMemo(() => {
    const list = Object.entries(allSpotTokenConfig?.[walletCoin] || {}).map(([key]) => ({
      value: key,
      label: key,
    }));

    list.unshift({
      value: '',
      label: 'allSymbolFilter',
    });
    return list;
  }, [allSpotTokenConfig]);

  useEffect(() => {
    handleResetFilter();
    setShowSymbol(symbolAll)
  }, [symbol, filterType]);

  // 主动选择是否展示当前币种
  useEffect(() => {
    // console.log('勾选-step3-symbol类型', '展示当前symbol-', showCurSymbol, autoUncheck, filterType)
    if (showCurSymbol && filterType) {
      const it = {
        value: symbol,
        label: symbol
      }
      setFilterValue(it); // 展示当前合约，则filterValue为当前币
    }
    // !filterType && autoUncheck
    if (autoUncheck) {
      // console.log('勾选-step4-symbol类型', '用户主动勾选不展示，则需要回到全部',symbolAll[0])
      setFilterValue(symbolAll[0]);  // 用户主动勾选不展示，则需要回到全部
    }

  }, [showCurSymbol, filterType, autoUncheck]);

  const handleResetFilter = () => {
    setFilterValue({
      value: '',
      label: 'allSymbolFilter'
    });
    if (!filterType) {
      setShowCurSymbol(false);
    }
  };

  useEffect(() => {
    const handleOutSideClick = () => {
      handleCloseDropDown()
    }
    window.addEventListener('click', handleOutSideClick);
    return () => {
      window.removeEventListener('click', handleOutSideClick);
    };
  }, []);

  const handleControlDropDown = (e) => {
    setOpenDropdown(pre => !pre)

    e.stopPropagation();
  }

  const handleCloseDropDown = () => {
    setOpenDropdown(false)
  }

  // 筛选的币种,如果不是当前页面币种，就把当前币种取消勾选，如果是当前币种，则默认勾选
  const handleSelectSymbol = (it) => {
    setFilterValue(it);
    handleCloseDropDown()
    // 选择了全部
    if (!it.value || (it.value && it.value !== symbol)) {
      setAutoUncheck(false) // 表示被动不展示
      setShowCurSymbol(false);
      return
    }
    if (it.value && it.value === symbol) {
      setShowCurSymbol(true);
    }
  }

  const handleClick = (e) => {
    e.stopPropagation();
  }

  const handleChangeSearch = (e) => {
    e.stopPropagation();
    const val = e.target.value;
    setSearchVal(val)
    const list = symbolAll.filter(it => {
      return it.label.toLowerCase().includes(val.toLowerCase());
    })
    setShowSymbol(list)
  }

  return (
    <div className={cls(Style.filter)}>
      <div className={cls(Style.filterWrapper, { [Style.filterWrapperOpen]: openDropdown })} onClick={handleControlDropDown}>
        <div className={Style.textWrapper}>{t('Symbol')}：{t(filterValue?.label)}</div>
        <div className={Style.iconWrapper}>
          <ArrowUpSvg className={cls(Style.icon, { [Style.iconOpen]: openDropdown })}/>
        </div>
      </div>
      <div className={cls(Style.dropDownWrapper, {
        [Style.displayBlock]: openDropdown
      })}>
        <Input
          prefix={<SearchSvg className={Style.searchIcon} />}
          value={searchVal}
          onClick={handleClick}
          onChange={handleChangeSearch}
          placeholder={t('searchSymbol')} />
          <div className={Style.dropDownList}>
            {showSymbol.map(it => {
              return <div key={it.value} className={cls(Style.dropDownItem, {
                [Style.dropDownItemActive]: filterValue?.value === it.value
              })} onClick={() => handleSelectSymbol(it)}>
                <span>{t(it?.label)}</span>
                <CheckSvg className={Style.checkIcon} />
              </div>
            })}
        </div>
      </div>
    </div>
  );
});

SymbolFilter.propTypes = {
  showCurSymbol: PropTypes.bool.isRequired,
  setShowCurSymbol: PropTypes.func.isRequired,
  autoUncheck: PropTypes.bool.isRequired,
  setAutoUncheck: PropTypes.func.isRequired,
};

const symbolFilterRef = createRef();
const handleResetFilter = () => {
  symbolFilterRef.current.handleResetFilter();
};

const handleSymbolCloseDropDown = () => {
  symbolFilterRef.current.handleCloseDropDown();
}

SymbolFilter.displayName = 'SymbolFilter'

export { symbolFilterRef, handleResetFilter, handleSymbolCloseDropDown };
export default SymbolFilter;
