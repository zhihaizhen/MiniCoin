import { Modal } from 'common/antdComponents';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LoginFailTips = (props) => {
  const { onCancel, showAuthAlertFlag, onConfirm } = props;

  const [t] = useTranslation();
  const [tGlobal] = useTranslation();

  return (
    <Modal
      head={tGlobal('alertWarning')}
      open={showAuthAlertFlag}
      onCancel={onCancel}
      onConfirm={onConfirm}
      onClose={onCancel}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
      width={330}
    >
      <div style={{ lineHeight: 1.5 }}>{tGlobal('reAuthFailTip')}</div>
    </Modal>
  );
};
LoginFailTips.defaultProps = {
  onCancel: () => { },
  showAuthAlertFlag: false,
  onConfirm: () => { },
};

LoginFailTips.propTypes = {
  // cancel callback
  onCancel: PropTypes.func,
  // 弹框展示标记
  showAuthAlertFlag: PropTypes.bool,
  // 取消关闭按钮回调
  onConfirm: PropTypes.func,
};

export default LoginFailTips;
