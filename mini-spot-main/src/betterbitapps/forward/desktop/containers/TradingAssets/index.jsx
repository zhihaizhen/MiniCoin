// import pushEvent from '@region/by-gtm';
import { Tooltip } from 'antd';
import { Card, Select } from 'common/antdComponents';
import { consoleLog } from 'common/utils/consoleLog';
import { toThousandsNumber, toThousandsNumberNoZero, getMinus, getPlus } from 'common/utils/utils';
import { storage } from 'by-storage';
import { getLang } from 'common/utils/storageData';
import cls from 'classnames';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { types, useGlobalState } from '@/store';
import { handleTransferUrl, handleDepositUrl, handleLoginUrl } from 'common/utils/url';
import useAssetStore from '@/store-hooks/use-asset-store';
import useUserStore from '@/store-hooks/use-user-store';
import { useCurSymbolConfig } from '@/store-hooks/use-symbol-config';
import {
  toGetUserPreferences,
  updateUserPreferenceSetting,
} from '@/services/user.service';
import 'react-grid-layout/css/styles.css';
import Style from './index.module.less';

const TradingAssets = () => {
  const [t] = useTranslation();
  const [t_error] = useTranslation('ztsl_error_code');
  const [state, globalDispatch] = useGlobalState();
  const {  assetOptionList } = state

  const { loggedIn } = useUserStore();
  const { walletCoin } = useCurSymbolConfig() || {};
  const [assetsSwitchStatus, setAssetsSwitchStatus] = useState(
    () => storage.get('showAssets') || '1',
  ); // 参考值 '0' || '1'
  const [highlightRef, setHighlightRef] = useState(null);
  const [selectCoin, setSelectCoin] = useState(walletCoin);
  const allWalletCoin = useAssetStore();

  const { avaliableAsset } = allWalletCoin?.[selectCoin] || {}

  const quickAssetsNums = [
    {
      label: 'contractAvailableBalance',
      money: avaliableAsset ? toThousandsNumberNoZero(Math.max(0, avaliableAsset), 8) : '--',
    }
  ];

  const handleAssetsSwitchShow = () => {
    if (!loggedIn) {
      handleLoginUrl();
      return
    }
    setAssetsSwitchStatus((currentStatus) => {
      const updatedStatus = currentStatus === '1' ? '0' : '1';
      storage.set('showAssets', updatedStatus);
      updateUserPreferenceSetting({ showAssets: updatedStatus });
      return updatedStatus;
    });
  };

  const handleWalletCoinChange = (val) => {
    setSelectCoin(val)
  }

  useEffect(() => {
    setSelectCoin(walletCoin);
  }, [walletCoin])

  const head = (
    <div className={`${Style['trade-assets__head']} full`}>
      <div className={Style.left}>
        <h5 className={`${Style['left-title']} semi-bold`}>
          {t('assetTitle')}
        </h5>
        <span
          className={cls(
            Style['left-eyes'],
            'icon iconfont f-12',
            {
              'icon-invisiable': assetsSwitchStatus === '1',
              'icon-disvisiable': !assetsSwitchStatus || assetsSwitchStatus !== '1',
            },
          )}
          onClick={handleAssetsSwitchShow}
        />
      </div>
      <div className={Style.right}>
        <Select
          suffixIcon={<span className="icon iconfont icon-xia" />}
          value={selectCoin}
          onChange={handleWalletCoinChange}
          options={assetOptionList}
        />
      </div>
    </div>

  );

  const guideHighlightRef = useCallback((node) => {
    if (node !== null) {
      setHighlightRef(node);
    }
  }, []);


  return (
    <Card
      className={`${Style["trade-assets__bg"]} text-secondary`}
      // ref={guideHighlightRef}
      head={head}
    >
      <div className={Style["trade-assets__body"]}>
        <div className={Style["trade-assets__center"]}>
          <For each="quickNum" of={quickAssetsNums}>
            <div className={Style["trade-assets__center-box"]} key={quickNum.label}>
              {/* label */}
              <If condition={quickNum.tipsKey}>
                <Tooltip
                  title={t(quickNum.tipsKey)}
                >
                  <p className={cls(Style["trade-assets__center-title"], Style["dashed-border"])}>
                    {t(quickNum.label)}
                  </p>
                </Tooltip>
              </If>
              <If condition={!quickNum.tipsKey}>
                <p className={cls(Style["trade-assets__center-title"], Style["trade-assets__label"])}>
                  {t(quickNum.label)}
                </p>
              </If>

              {/* value */}
              <p
                className={cls(
                  Style['trade-assets__center-txt'],
                  {
                    [Style['trade-assets__center-txt-hide']]:
                      assetsSwitchStatus === '0',
                  },
                )}
              >
                {assetsSwitchStatus === '1' ? quickNum.money : '********'}
              </p>
            </div>
          </For>
        </div>
        <div className={Style.btns}>
          <div className={Style['btn-item']} onClick={() => handleTransferUrl(t, t_error, loggedIn)}>
            {t('transferBtn')}
          </div>
          <div className={Style['btn-item']} onClick={handleDepositUrl} >
            {t('depositBtn')}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TradingAssets;
