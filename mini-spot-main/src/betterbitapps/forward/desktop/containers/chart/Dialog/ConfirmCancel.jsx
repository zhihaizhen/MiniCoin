import { KLINE_DIALOG_WIDTH } from '@/constants/layout';
import { updateUserPreferenceSetting } from '@/services/user.service';
import { types, useGlobalState } from '@/store';
import { Checkbox, Modal } from 'common/antdComponents';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

const ConfirmCancel = ({
  cancelOrderParams,
  setCancelOrderParams,
  ifHideCancelOrderTip,
  setIfHideCancelOrderTip,
  confirmLoading,
  setConfirmLoading,
  sendCancelConditionsPositionOrder,
  sendCancelActivityPositionOrder,
}) => {
  const [, dispatchGlobal] = useGlobalState();
  const [t] = useTranslation();

  const handleCloseOrderCancel = () => {
    setConfirmLoading(false);
    setCancelOrderParams(null);
    setIfHideCancelOrderTip(false);
  };

  const handleConfirmCancelOrder = () => {
    setConfirmLoading(true);
    const { type } = cancelOrderParams;
    if (type === 'Activity') {
      sendCancelActivityPositionOrder(cancelOrderParams);
    } else {
      sendCancelConditionsPositionOrder(cancelOrderParams);
    }
    const updatedCancelTip = ifHideCancelOrderTip ? 'hide' : 'show';
    updateUserPreferenceSetting({
      klineCancelOrderTipStatus: updatedCancelTip,
    });
    dispatchGlobal({
      type: types.SET_CANCEL_ORDER_TIP_STATUS,
      status: updatedCancelTip,
    });
  };

  return (
    <Modal
      width={KLINE_DIALOG_WIDTH}
      head={t('orderLineTipInfo')}
      showConfirm
      open={!!cancelOrderParams}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
      onClose={handleCloseOrderCancel}
      onConfirm={handleConfirmCancelOrder}
      onCancel={handleCloseOrderCancel}
      confirming={confirmLoading}
    >
      {t('orderLineCancelOrder')}
      <div className={styles.klineDivideLine} />
      <div>
        <Checkbox
          checked={ifHideCancelOrderTip}
          onChange={e => setIfHideCancelOrderTip(e.target.checked)}
        >
          <span>{t('orderLineNoPrompt')}</span>
        </Checkbox>
      </div>
    </Modal>
  );
};

ConfirmCancel.defaultProps = {
  cancelOrderParams: null,
};

ConfirmCancel.propTypes = {
  cancelOrderParams: PropTypes.object, // 参数
  setCancelOrderParams: PropTypes.func.isRequired, // 参数修改回调
  ifHideCancelOrderTip: PropTypes.bool.isRequired, // 隐藏弹框
  setIfHideCancelOrderTip: PropTypes.func.isRequired, // 隐藏弹框修改回调
  confirmLoading: PropTypes.bool.isRequired, // 确认Loading 显示
  setConfirmLoading: PropTypes.func.isRequired, // 确认Loading修改回调
  sendCancelConditionsPositionOrder: PropTypes.func.isRequired, // 取消条件单回调
  sendCancelActivityPositionOrder: PropTypes.func.isRequired, // 取消活动价单回调
};

export default ConfirmCancel;
