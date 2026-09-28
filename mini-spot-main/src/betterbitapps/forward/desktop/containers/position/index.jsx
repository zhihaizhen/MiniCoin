// import pushEvent from '@region/by-gtm';
// @ts-ignore
import { Card, Checkbox } from 'common/antdComponents';
import { consoleLog } from 'common/utils/consoleLog';
import cls from 'classnames';
import { If } from 'common/global/tsx-control-statement/index.d';
import { loginUrl, registerUrl, handleRegisterUrl } from 'common/utils/url';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useOrderStore from '@/store-hooks/use-order-store';
import { types, useGlobalState } from '@/store';
import { getUserPrivateDetail } from '@/services/user.service';
import PositionsDeal from './components/TradeDetail';
import PositionsHistory from './components/history-entrust';
import PositionsEntrust from './components/current-entrust';
import { POSITION_TAB_LIST } from './constant';
import Style from './index.module.less';

const Position = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const [t] = useTranslation();
  const [current, setCurrent] = useState({}); // 当前tab
  const [highlightRef, setHighlightRef] = useState(null);
  const [autoUncheck, setAutoUncheck] = useState(false); // 是否主动不勾选当前symbol
  const [showCurSymbol, setShowCurSymbol] = useState(false); // 是否勾选当前symbol

  const { currentEntrustList } = useOrderStore();
  const {
    user: { info, userInfo },
    symbol,
  } = globalState;

  const uid = info.id;

  const currentEntrustLength = useMemo(() => {
    return currentEntrustList?.data?.length;
  }, [currentEntrustList]);

  const setCurrentTab = (tab) => {
    if (tab.name === current.name || uid <= 0) return;
    setCurrent(tab);
  };

  useEffect(() => {
    if (uid > 0 && userInfo.defaultAccountId) {
      getUserPrivateDetail(symbol, globalDispatch, userInfo.defaultAccountId);
      setCurrent(POSITION_TAB_LIST[0]);
      setShowCurSymbol(false);
    } else {
      setCurrent({});
    }
  }, [globalDispatch, uid, userInfo.defaultAccountId, symbol]);

  // 展示当前币种
  const handleShowCurSymbol = (e) => {
    const { checked } = e.target;
    setShowCurSymbol(checked);
    if (!checked) {
      setAutoUncheck(true);
    } else {
      setAutoUncheck(false);
    }
    // console.log('勾选-step1,是否勾选', checked, '是否主动不勾选', !checked)
  };

  //
  const handleChangeTab = (tab) => {
    setCurrentTab(tab);
    setShowCurSymbol(false);
  };

  const propsObj = useMemo(() => {
    return {
      showCurSymbol,
      setShowCurSymbol,
      tab: current,
      autoUncheck,
      setAutoUncheck,
      filterType: symbol,
    };
  }, [current, showCurSymbol]);

  const PositionTitle = (
    <>
      <div className={`${Style.position_header} full f-12`}>
        <div className={Style.position_header_left}>
          <div
            className={Style.position_header_tabs}
            data-coachmark-step="order-tabs"
          >
            <For each="curTab" of={POSITION_TAB_LIST} index="inx">
              <span
                key={inx}
                className={
                  current.name === curTab.name
                    ? cls(Style.active, Style[curTab.name])
                    : Style[curTab.name]
                }
                onClick={() => handleChangeTab(curTab)}
              >
                {t(curTab.title)}

                {/* <If condition={curTab.name === POSITION_TAB_LIST[0].name}>
                  <i>&nbsp; ({currentEntrustLength})</i>
                </If> */}
              </span>
            </For>
          </div>
        </div>
        <div
          className={`${Style['position__header--title--center']} ${Style['re-draggable']}`}
        />
        <div className={Style['position__header--title--right']}>
          {/* 显示当前币种 */}
          <Checkbox checked={showCurSymbol} onChange={handleShowCurSymbol}>
            <span style={{ whiteSpace: 'nowrap' }}>
              {t('showCurSymbolInPosition')}
            </span>
          </Checkbox>
        </div>
      </div>
    </>
  );

  const guideHighlightRef = useCallback((node) => {
    if (node !== null) {
      setHighlightRef(node);
    }
  }, []);

  useEffect(() => {
    const el = document.getElementById('position-register');
    if (!el) return () => {};
    el.addEventListener('click', handleRegisterUrl, false);
    return () => {
      el.removeEventListener('click', handleRegisterUrl);
    };
  }, []);


  return (
    <Card
      // ref={guideHighlightRef}
      head={PositionTitle}
      className={cls(Style.position, Style['position-card-container'], {
        [Style['position-unlogin']]: uid <= 0,
      })}
    >
      <div className={Style['position-card-body']}>
        <Choose>
          <When condition={current.name === POSITION_TAB_LIST[0].name}>
            <PositionsEntrust {...propsObj} />
          </When>
          <When condition={current.name === POSITION_TAB_LIST[1].name}>
            <PositionsHistory {...propsObj} />
          </When>
          <When condition={current.name === POSITION_TAB_LIST[2].name}>
            <PositionsDeal {...propsObj} />
          </When>
          <Otherwise>
            <div className={Style['position-loading']}>
              <If condition={uid > 0}>
                <span className="circle-loading icon iconfont icon-loading" />
              </If>
              <If condition={uid <= 0}>
                <span
                  className={Style['pls-login']}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{
                    __html: t('positionLead', {
                      login: `<a class="brand-color" href=${loginUrl()}> ${t(
                        'login',
                      )} </a>`,
                      register: `<a class="brand-color" href=${registerUrl()} id="position-register"> ${t(
                        'register',
                      )} </a>`,
                    }),
                  }}
                />
              </If>
            </div>
          </Otherwise>
        </Choose>
      </div>
    </Card>
  );
};

export default Position;
