import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { toThousandsNumberNoZero } from 'common/utils/utils';
import { useGlobalState } from '@/store';
import useUserStore from '@/store-hooks/use-user-store';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import useAssetStore from '@/store-hooks/use-asset-store';
import { adjustLocationByTime } from 'common/packages-biz/trade-chart';
import { ReactComponent as NoDataSvg } from 'common/assets/images/noData.svg';
import { ReactComponent as MoreSvg } from 'common/assets/images/arrow-right-brand.svg';
import { ReactComponent as EmptyWalletSvg } from 'common/assets/images/emptyWallet.svg';
import { handleTransferUrl, handleDepositUrl } from 'common/utils/url';
import Style from './index.module.less';


const PositionTab = ({ tab, data, innerClass, headerClass, rowClass }) => {
  const [t] = useTranslation();
  const [t_error] = useTranslation('ztsl_error_code');
  const { trs = [] } = tab;
  // const [globalState] = useGlobalState();
  const { symbol, spotCoin,  walletCoin, walletCoinOrderFraction } = useCurSymbolConfig();
  const { loggedIn } = useUserStore();
  const allWalletCoin = useAssetStore(symbol);
  // 需要判断买卖， 买 walletcoin 卖spotCoin
  // 此处简单点，只判断买
  const { avaliableAsset } = allWalletCoin?.[walletCoin] || {};

  // 横向滚动阴影：根据滚动位置切换 pingLeft / pingRight，配合 hover 给固定列加边缘阴影
  const wrapperRef = useRef(null);
  const [ping, setPing] = useState({ left: false, right: false });

  const updatePing = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setPing({
      left: scrollLeft > 0,
      right: scrollLeft < maxScroll - 1,
    });
  }, []);

  useEffect(() => {
    updatePing();
    const el = wrapperRef.current;
    if (!el) return undefined;
    el.addEventListener('scroll', updatePing, { passive: true });
    window.addEventListener('resize', updatePing);
    return () => {
      el.removeEventListener('scroll', updatePing);
      window.removeEventListener('resize', updatePing);
    };
  }, [updatePing, data]);

  const handleClickPositionRow = (trData) => {
      adjustLocationByTime(trData); 
  };

  const handleShowMore = () => {
    const urlMap = {
      entrust: '/assets/history/spot-open',
      history: '/assets/history/spot-order',
      deal: '/assets/history/spot-trade',
    };  // 大宗最新的
    //  const urlMap = {
    //   entrust: '/assets/history/spot-open-order',
    //   history: '/assets/history/spot-order-history',
    //   deal: '/assets/history/spot-trade-history',
    // };
    const url = `${urlMap[tab.name]}`;
    window.location.href = url;
  };

  // 委托数据优先：只要 data 非空就渲染表格，避免余额为 0 时被空钱包态挡住（即使已有委托）
  // 可用余额可能因资金被订单占用而显示为 0，不代表没有委托/成交记录（原逻辑仅按余额判断，会误挡）
  const hasData = Array.isArray(data) && data.length > 0;

  return (
      <Choose>
        <When condition={ hasData }>
          <div
            className={classNames(Style['table-wrapper'], {
              [Style.pingLeft]: ping.left,
              [Style.pingRight]: ping.right,
            })}
            ref={wrapperRef}
          >
            <table className={classNames(Style.position__table, innerClass)}>
              <thead
                className={classNames(Style.position__table__title, headerClass)}
              >
                <tr>
                  <For each="th" of={trs} index="inx">
                    <If condition={th.nameTip}>
                      <th
                        key={inx}
                        className={Style[th?.thClass || th?.class]}
                        style={th.thStyle || th.style}
                      >
                        <Tooltip title={th.nameTip}>
                          <span className={Style['dashed-border']}>
                            {th.name}
                          </span>
                        </Tooltip>
                      </th>
                    </If>
                    <If condition={!th.nameTip}>
                      <th
                        key={inx}
                        className={Style[th?.thClass || th?.class]}
                        style={th.thStyle || th.style}
                      >
                        {th.name}
                      </th>
                    </If>
                  </For>
                </tr>
              </thead>
              <tbody
                className={`${Style.position__table__content}`}
              >
                <For index="trInx" of={data} each="trData">
                  <tr
                    key={trInx}
                    className={rowClass(trData)}
                    onClick={() => handleClickPositionRow(trData)}
                  >
                    <For each="tr" of={trs} index="inx">
                      <td
                        key={inx}
                        className={Style[tr?.tdClass || tr?.class]}
                        style={tr.tdStyle || tr.style}
                      >
                        <Choose>
                          <When condition={tr.showIndex}>{trInx + 1}</When>
                          <When condition={tr.render}>{tr.render(trData)}</When>
                          <Otherwise>{trData[tr.key]}</Otherwise>
                        </Choose>
                      </td>
                    </For>
                  </tr>
                </For>
              </tbody>
            </table>
          </div>
          <div className={Style.recordTip}>
            {t('currentEntrustRecordTip')}
            <span className={Style.more} onClick={handleShowMore}>
              {t('viewMore')}
            </span>
            <MoreSvg className={Style.moreIcon} />
          </div>
        </When>
        <When condition={ !avaliableAsset }>
          <div className={Style['demo-trade']}>
            <EmptyWalletSvg />
            <div className={Style.wallet}>{t('Available Balance')}:&nbsp;
              {toThousandsNumberNoZero(avaliableAsset, walletCoinOrderFraction )}
            </div>
            <div className={Style.btns}>
              <div className={Style['btn-item']} onClick={() => handleTransferUrl(t, t_error, loggedIn)}>
                {t('transferBtn')}
              </div>
              <div  className={Style['btn-item']}  onClick={handleDepositUrl} >
                {t('depositBtn')}
              </div>  
            </div>
          </div>
        </When>
        <Otherwise>
          <div className={Style['no-data']}>
            <NoDataSvg className={Style['nodata-icon']} />
            <div className={Style.text}>{t('bookSymbolNoData')}</div>
          </div>
        </Otherwise>
      </Choose>
  );
};

PositionTab.defaultProps = {
  data: [],
  innerClass: undefined,
  headerClass: undefined,
  rowClass: () => { },
};

PositionTab.propTypes = {
  tab: PropTypes.object.isRequired,
  data: PropTypes.array,
  innerClass: PropTypes.string,
  headerClass: PropTypes.string,
  rowClass: PropTypes.func,
};

export default PositionTab;
