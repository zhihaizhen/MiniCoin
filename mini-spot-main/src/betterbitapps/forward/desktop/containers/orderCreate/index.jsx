// import pushEvent from '@region/by-gtm';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cls from 'classnames';
import { ORDER_ACTION } from 'common/packages-biz/global-settings/usdt-settings';
import OrderCreationPanel from './Double/OrderCreationPanel';
import './order-create.less';

const OrderCreate = () => {
  const [t] = useTranslation();
  const [orderCreateMode, setOrderCreateMode] = useState(ORDER_ACTION.BUY);
  const handleSideChange = (value) => {
    if (value === orderCreateMode) return;
    setOrderCreateMode(value);
  };

  return (
    <div className="ocPanel" >
      <div className="ocSwitch">
        <div
          className={cls("ocItem", {
            "active": orderCreateMode === ORDER_ACTION.BUY,
          })}
          onClick={() => handleSideChange(ORDER_ACTION.BUY)}
        >
          {t('BUY')}
        </div>
        <div
          className={cls("ocItem", {
            "active": orderCreateMode === ORDER_ACTION.SELL,
          })}
          onClick={() => handleSideChange(ORDER_ACTION.SELL)}
        >
          {t('SELL')}
        </div>
      </div>
      <OrderCreationPanel orderSide={orderCreateMode} />
    </div>
  );
};

export default OrderCreate;
