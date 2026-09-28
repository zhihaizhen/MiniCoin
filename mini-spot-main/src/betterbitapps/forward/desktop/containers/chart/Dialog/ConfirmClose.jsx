import { KLINE_DIALOG_WIDTH } from '@/constants/layout';
import { updateUserPreferenceSetting } from '@/services/user.service';
import { types, useGlobalState } from '@/store';
import { Checkbox, Modal } from 'common/antdComponents';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './index.module.less';

const ConfirmClose = ({
  closePositionParams,
  setClosePositionParams,
  ifHideClosePositionTip,
  setIfHideClosePositionTip,
  confirmLoading,
  setConfirmLoading,
  sendCreateOrder,
}) => {
  const [, dispatchGlobal] = useGlobalState();
  const [t] = useTranslation();

  const handleCancelClosePosition = () => {
    setConfirmLoading(false);
    setClosePositionParams(null);
    setIfHideClosePositionTip(false);
  };

  const handleConfirmClosePosition = () => {
    setConfirmLoading(true);
    sendCreateOrder(closePositionParams);
    const updatedCloseTip = ifHideClosePositionTip ? 'hide' : 'show';
    updateUserPreferenceSetting({
      closePositionStatus: updatedCloseTip,
    });
    dispatchGlobal({
      type: types.SET_CLOSE_POSITION_TIP_STATUS,
      status: updatedCloseTip,
    });
  };

  return (
    <Modal
      width={KLINE_DIALOG_WIDTH}
      head={t('orderLineTipInfo')}
      open={!!closePositionParams}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
      onClose={handleCancelClosePosition}
      onConfirm={handleConfirmClosePosition}
      onCancel={handleCancelClosePosition}
      confirming={confirmLoading}
    >
      {t('orderLineClosePosition')}
      <div className={styles.klineDivideLine} />
      <Checkbox
        checked={ifHideClosePositionTip}
        onChange={e => setIfHideClosePositionTip(e.target.checked)}
      >
        <span>{t('orderLineNoPrompt')}</span>
      </Checkbox>
    </Modal>
  );
};

ConfirmClose.defaultProps = {
  closePositionParams: null,
};

ConfirmClose.propTypes = {
  closePositionParams: PropTypes.object, // 参数
  setClosePositionParams: PropTypes.func.isRequired, // 参数修改回调
  ifHideClosePositionTip: PropTypes.bool.isRequired, // 隐藏弹框
  setIfHideClosePositionTip: PropTypes.func.isRequired, // 隐藏弹框修改回调
  confirmLoading: PropTypes.bool.isRequired, // 确认Loading 显示
  setConfirmLoading: PropTypes.func.isRequired, // 确认Loading修改回调
  sendCreateOrder: PropTypes.func.isRequired, // 仓位接口
};

export default ConfirmClose;
