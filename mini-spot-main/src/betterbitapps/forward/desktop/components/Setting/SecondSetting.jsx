import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { USER_SETTINGS } from 'common/packages-biz/global-settings';
import {
  saveDoubleConfirm,
  updateUserPreferenceSetting,
} from '@/services/user.service';
import { types, useGlobalState } from '@/store';
import SettingItem from './SettingItem';
import Style from './setting.module.less';

const { ORDER_CONFIRM, CANCEL_ALL_CONFIRM, OB_ANIMATION, REVERSE_ORDER } = USER_SETTINGS;
const SecondSetting = () => {
  const [t] = useTranslation();
  const [globalState, globalDispatch] = useGlobalState();
  const { user } = globalState;
  const defaultDoubleConfirmList = user?.info?.double_confirm?.split(',') ?? [];
  const [doubleConfirmList, setDoubleConfirmList] = useState(
    defaultDoubleConfirmList,
  );
  const [oneClickCloseTrigger, setoneClickCloseTrigger] = useState(false);
  const {
    closePositionTipStatus,
    cancelOrderTipStatus,
  } = user.kline;

  /**
   * update double confirm settings
   */
  const handleConfirmationSettingClick = (c, eventLabel) => {
    const i = doubleConfirmList.indexOf(c);
    let n;
    if (i === -1) {
      n = [...doubleConfirmList, c];
    } else {
      n = doubleConfirmList.filter((x) => x !== c);
    }
    setDoubleConfirmList(n);
    saveDoubleConfirm(n).then(() => {
      globalDispatch({
        type: types.UPDATE_ORDER_CONFIRM,
        newDoubleConfirm: n.join(','),
      }); //  state['user'].info.double_confirm = newDoubleConfirm;
    });
  };

  const handleHideClosePositionTipCheck = () => {
    const updatedCloseTip = closePositionTipStatus === 'show' ? 'hide' : 'show';
    updateUserPreferenceSetting({
      closePositionStatus: updatedCloseTip,
    });
    globalDispatch({
      type: types.SET_CLOSE_POSITION_TIP_STATUS,
      status: updatedCloseTip,
    });
  };

  const handleHideCancelOrderTipCheck = () => {
    const updatedCloseTip = cancelOrderTipStatus === 'show' ? 'hide' : 'show';
    updateUserPreferenceSetting({ klineCancelOrderTipStatus: updatedCloseTip });
    globalDispatch({
      type: types.SET_CANCEL_ORDER_TIP_STATUS,
      status: updatedCloseTip,
    });
  };



  // 控制一键平仓弹窗
  const handleOneClickDoubleConfirm = () => {
    const status = !oneClickCloseTrigger;
    setoneClickCloseTrigger(status);
    localStorage.setItem('oneClickCloseTrigger', status ? 1 : 0);
  };

  const doubleConfirmSettingMap = [
    [
      {
        title: t('positionModal'), // Order Confirmation
        desc: t('positionModalDesc'),
        toggleVal: doubleConfirmList.indexOf(ORDER_CONFIRM) !== -1,
        changeFunc: () =>
          handleConfirmationSettingClick(ORDER_CONFIRM, 'order_confiemation'),
      },
      {
        title: t('cancelAllModal'), // Cancel All Orders
        desc: t('cancelAllModalDesc'),
        toggleVal: doubleConfirmList.indexOf(CANCEL_ALL_CONFIRM) !== -1,
        changeFunc: () =>
          handleConfirmationSettingClick(
            CANCEL_ALL_CONFIRM,
            'candel_all_orders',
          ),
      }],
      
    // [
    //   {
    //     title: t('klineClosePositionTitle'), // Quick Close
    //     desc: t('klineClosePositionContent'),
    //     toggleVal: closePositionTipStatus === 'show',
    //     changeFunc: handleHideClosePositionTipCheck,
    //   },
    // ],
    // [
    //   {
    //     title: t('klineCancelOrderTitle'), // Quick Cancel
    //     desc: t('klineCancelOrderContent'),
    //     toggleVal: cancelOrderTipStatus === 'show',
    //     changeFunc: handleHideCancelOrderTipCheck,
    //   },
 
    // ],
    // [
    //   {
    //     title: t('oneClickCloseTriggerTitle'), // Quick Cancel
    //     desc: t('oneClickCloseTriggerDesc'),
    //     toggleVal: oneClickCloseTrigger,
    //     changeFunc: handleOneClickDoubleConfirm,
    //   },
    // ],
  ];

  useEffect(() => {
    const _oneClickCloseTrigger = localStorage.getItem('oneClickCloseTrigger');
    if (_oneClickCloseTrigger !== '1' && _oneClickCloseTrigger !== '0') {
      localStorage.setItem('oneClickCloseTrigger', 1);
    }
    setoneClickCloseTrigger(_oneClickCloseTrigger !== '0');
  }, []);

  return (
    <>
      <For each="doubleConfirmSettingItem" of={doubleConfirmSettingMap}>
        <div
          key={doubleConfirmSettingItem[0].title}
          className={Style['setting__second-line']}
        >
          <For each="singleItem" of={doubleConfirmSettingItem}>
            <div key={singleItem.title}>
              <SettingItem
                data={singleItem}
                className={Style['setting__second-item']}
                titleClassName={Style['setting__second-confirm-title']}
                descClassName={Style['setting__second-confirm-desc']}
              />
            </div>
          </For>
        </div>
      </For>
    </>
  );
};

SecondSetting.defaultProps = {};

SecondSetting.propTypes = {};

export default SecondSetting;
