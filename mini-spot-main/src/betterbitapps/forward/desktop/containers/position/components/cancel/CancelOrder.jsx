import { Button } from 'antd';
import { message } from 'common/antdComponents';
import { cancelOrder, cancelPlanOrder } from '@/services/order.service';
import {
  refreshCurrentEntrustList,
  refreshCurrentPlanFamilyLists,
} from '@/services/user.service';
import { TAB_KEY } from '../../constant';
import estimator from 'common/utils/estimator';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalState } from '@/store';
import Styles from '../index.module.less'

// 取消委托
const CancelOrder = ({ trData, type, orderKind, disableOperate }) => {
  const [globalState, globalDispatch] = useGlobalState();
  const { user, symbol } = globalState;
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  // 按委托项自身 isPlan 判定家族（normalizeEntrustItem 已写入）；止盈止损/计划委托子 tab
  // 现均为 plan 家族独立接口数据，限价市价子 tab 为 order 家族，isPlan 与 orderKind 一致。
  const isPlanKind = Boolean(trData?.isPlan);
  // function
  const cancel = estimator('usdt cancel', () => {
    if (disableOperate) return
    setLoading(true);
    const cancelFn = isPlanKind ? cancelPlanOrder : cancelOrder;
    const idParams = isPlanKind
      ? { plan_order_id: trData.plan_order_id ?? trData.orderKey }
      : { order_id: trData.orderId ?? trData.orderKey };
    const accountId = user?.userInfo?.defaultAccountId;
    cancelFn({
      ...idParams,
      account_id: accountId,
    })
      .then(() => {
        message.success(t('cancelSuccess'));
        // WS 对撤单的推送不总是可靠，撤单成功后主动拉取一次对应列表。
        // 计划委托 / 止盈止损共用 open_orders 合集刷新，一次更新两桶。
        const refresh =
          orderKind === TAB_KEY.TPSL || orderKind === TAB_KEY.TRIGGER
            ? refreshCurrentPlanFamilyLists
            : refreshCurrentEntrustList;
        refresh(symbol, globalDispatch, accountId).catch(() => {});
      })
      .finally(() => {
        setLoading(false);
      });
  });

  return (
    <Button
      onClick={cancel}
      type="outlined"
      color="primary"
      size="small"
      loading={loading}
      disabled={disableOperate}
    >
      {t('cancelOrder')}
    </Button >
  );
};

CancelOrder.defaultProps = {
  type: 'activity',
  orderKind: 'limit',
  disableOperate: false
};

CancelOrder.propTypes = {
  trData: PropTypes.object.isRequired,
  type: PropTypes.string,
  orderKind: PropTypes.string,
  disableOperate: PropTypes.bool
};

export default CancelOrder;
