import React, { useMemo } from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'common/antdComponents';
import { ORDER_TYPE } from 'common/packages-biz/global-settings/usdt-settings';
import { getLang } from 'common/utils/storageData';
import { types, useGlobalState } from '@/store';
import styles from './index.module.less';

function OrderTypes({ value, onChange, name }) {
  const [t] = useTranslation();
  const [, globalDispatch] = useGlobalState();
  const isCN = getLang() === 'zh-CN';
  // 计划委托悬浮提示「了解更多」跳转地址
  const handleLearnMoreClick = (e) => {
    e.stopPropagation();
    window.location.href = isCN ?`https://easicoin.zendesk.com/hc/zh-CN/articles/16774246461199-%E7%8E%B0%E8%B4%A7%E8%AE%A1%E5%88%92%E5%A7%94%E6%89%98%E6%98%AF%E4%BB%80%E4%B9%88-EasiCoin-Trigger-Order-%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97`:
    'https://easicoin.zendesk.com/hc/en-us/articles/16959394676111'
  };

  const orderTypeList = useMemo(() => {
    const options = [
      {
        key: ORDER_TYPE.LIMIT,
        label: (
          <Tooltip title={t('hoverTipsLimit')} placement="topLeft">
            <span>{t('limitEntrust')}</span>
          </Tooltip>
        ),
      },
      {
        key: ORDER_TYPE.MARKET,
        label: (
          <Tooltip title={t('hoverTipsMarket')} placement="top">
            <span>{t('marketType')}</span>
          </Tooltip>
        ),
      },
      {
        key: ORDER_TYPE.CONDITION,
        label: (
          <Tooltip
            title={
              <>
                {t('hoverTipsConditional')}
                <span
                  className={styles.learnMore}
                  onClick={handleLearnMoreClick}
                >
                  {t('knowMore')}
                </span>
              </>
            }
          >
            <span>{t('triggerEntrust')}</span>
          </Tooltip>
        ),
      },
    ];
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const handleTypeChange = (orderType) => {
    globalDispatch({ type: types.SET_ORDER_TYPE, orderType });
    if (onChange) {
      onChange(orderType, name);
    }
  };

  return (
    <Tabs
      className={styles.orderType}
      activeKey={value}
      onChange={handleTypeChange}
      items={orderTypeList}
    />
  );
}

OrderTypes.defaultProps = {
  name: undefined,
};

OrderTypes.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
};

export default OrderTypes;
