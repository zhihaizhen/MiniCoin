import { Switch } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { types, useGlobalState } from '@/store';
import { updateUserPreferenceSetting } from '@/services/user.service';
import Style from './setting.module.less'

const OrderBookQuickSetting = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const { user } = globalState;
  const { orderBookSetting } = user;
  const [t] = useTranslation();
  const [toggleVal, setToggleVal] = useState(
    orderBookSetting.quickOperate === 'hide',
  );

  const handleToggleSetting = () => {
    const key = 'quickOperate';
    const newSettingObj = JSON.stringify({
      ...orderBookSetting,
      [key]: orderBookSetting[key] === 'hide' ? 'show' : 'hide',
    });
    updateUserPreferenceSetting({
      orderBookPreferSet: newSettingObj,
    });
    globalDispatch({
      type: types.SET_ORDER_BOOK_SETTING,
      status: newSettingObj,
    });
    setToggleVal(!toggleVal);
  };

  return (
    <div className={`${Style["setting-sub-title"]} ${Style["setting-quick-cancel"]} ${Style["flex-center"]}`}>
      {t('orderBookQuickOperationSetting')}
      <Switch size="small" checked={toggleVal} onChange={handleToggleSetting} />
    </div>
  );
};

export default OrderBookQuickSetting;
