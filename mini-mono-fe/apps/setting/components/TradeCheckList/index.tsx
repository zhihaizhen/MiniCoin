// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, ConfigProvider, Modal } from 'antd';
import {
  checkConfirm,
  toUpdateUserPreferences,
  toGetUserPreferences
} from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import Style from './index.module.less';

interface TradeCheckListProps {
  userInfo: any;
  open: boolean;
  onClose: () => void;
}

const TradeCheckList: React.FC<TradeCheckListProps> = ({
  userInfo,
  open,
  onClose
}) => {
  const t = useFm();
  const { double_confirm: checkList = '' } = userInfo;
  const [futuresCurrentList, setFuturesCurrentList] = useState([]);
  const [spotCurrentList, setSpotCurrentList] = useState([]);
  const [quickCancel, setQuickCancel] = useState(false);
  const [quickClose, setQuickClose] = useState(false);

  useEffect(() => {
    toGetUserPreferences([
      'closePositionStatus',
      'klineCancelOrderTipStatus'
    ]).then((res) => {
      const { preferences } = res || {};
      const {
        closePositionStatus = 'show',
        klineCancelOrderTipStatus = 'show'
      } = preferences || {};
      setQuickCancel(klineCancelOrderTipStatus === 'show');
      setQuickClose(closePositionStatus === 'show');
    });
  }, []);

  useEffect(() => {
    setFuturesCurrentList(checkList?.split(','));
    setSpotCurrentList(checkList?.split(','));
  }, [checkList]);

  const onChangeConfirm = useCallback(async (checkedValues) => {
    setFuturesCurrentList(checkedValues);
    await checkConfirm(checkedValues);
  }, []);

  const onChangeConfirmSpot = useCallback(async (checkedValues) => {
    setSpotCurrentList(checkedValues);
    await checkConfirm(checkedValues);
  }, []);

  const changeQuick = useCallback(async (v) => {
    const { checked, value } = v.target;
    const param = {};
    param[value] = checked ? 'show' : 'hide';
    value === 'klineCancelOrderTipStatus'
      ? setQuickCancel(checked)
      : setQuickClose(checked);
    await toUpdateUserPreferences(param);
  }, []);

  const options = useMemo(() => {
    return [
      {
        label: t('order-confirmation', 'Order Confirmation'),
        value: 'confirmOrder'
      },
      {
        label: t('cancel-all-orders'),
        value: 'confirmCancelAll'
      }
    ];
  }, [t]);

  const spotOptions = useMemo(() => {
    return [
      {
        label: t('order-confirmation', 'Order Confirmation'),
        value: 'spot.confirmOrder'
      },
      {
        label: t('cancel-all-orders'),
        value: 'spot.confirmCancelAll'
      }
    ];
  }, [t]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Checkbox: {
            colorPrimary: '#101112',
            colorPrimaryHover: '#101112',
            colorWhite: '#ffffff',
            borderRadiusSM: 4
          }
        }
      }}
    >
      <Modal
        open={open}
        title={t('trade-setting', 'Trade Settings')}
        onCancel={onClose}
        maskClosable={false}
        width={440}
        className={Style.tradeModal}
        footer={
          <div className={Style.btnRow}>
            <Button className={Style.secondaryButton} onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              className={Style.primaryButton}
              type="primary"
              onClick={onClose}
            >
              {t('confirmBtn')}
            </Button>
          </div>
        }
      >
        <div className={Style.section}>
          <div className={Style.title}>{t('futures-trade')}</div>
          <Checkbox.Group
            defaultValue={futuresCurrentList}
            onChange={onChangeConfirm}
            key={futuresCurrentList}
          >
            {options.map((item) => (
              <Checkbox value={item.value} key={item.value}>
                {item.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
          <Checkbox
            checked={quickCancel}
            onChange={changeQuick}
            value={'klineCancelOrderTipStatus'}
          >
            {t('quick-cancel')}
          </Checkbox>
          <Checkbox
            checked={quickClose}
            onChange={changeQuick}
            value={'closePositionStatus'}
          >
            {t('quick-close')}
          </Checkbox>
        </div>
        <div className={Style.section}>
          <div className={Style.title}>{t('spot-trade')}</div>
          <Checkbox.Group
            defaultValue={spotCurrentList}
            onChange={onChangeConfirmSpot}
            key={spotCurrentList}
          >
            {spotOptions.map((item) => (
              <Checkbox value={item.value} key={item.value}>
                {item.label}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default TradeCheckList;
