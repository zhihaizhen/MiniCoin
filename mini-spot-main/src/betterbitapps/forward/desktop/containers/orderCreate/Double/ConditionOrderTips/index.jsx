import { Checkbox, Modal } from 'common/antdComponents';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Styles from './index.module.less';

/**
 * 计划委托温馨提示弹窗
 * - 切换到计划委托 tab 时由父组件控制 open
 * - 点「我知道了」时若勾选「不再提示」，通过 onConfirm({ dontShowAgain }) 回传父组件写入 localStorage
 * - 点 X 仅关闭，不持久化
 */
const ConditionOrderTips = ({ open, onConfirm, onClose }) => {
  const [t] = useTranslation();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // 每次打开重置勾选，避免上次勾选态残留
  useEffect(() => {
    if (open) setDontShowAgain(false);
  }, [open]);

  const handleGotIt = () => {
    onConfirm({ dontShowAgain });
  };

  return (
    <Modal
      className={Styles.modal}
      width={440}
      open={open}
      onClose={onClose}
      onCancel={onClose}
      footer={null}
      closable={false}
      destroyOnClose
    >
      <div className={Styles.body}>
        <div className={Styles.header}>
          <p className={Styles.title}>{t('planOrderTipInfo')}</p>
          <span
            className={`icon iconfont icon-close ${Styles.close}`}
            onClick={onClose}
          />
        </div>
        <p className={Styles.content}>
          {t('conditionOrderTipsContent', {
            defaultValue:
              '您设置的计划委托不一定能成功触发，可能会因为行情波动剧烈、价格限制、仓位限制、资产不足、系统问题，或合约处在非交易状态等原因而下单失败。触发成功后的计划委托即变为普通的限价/市价委托，不一定能够成交，未成交的限价/市价委托会展示在当前委托的限价/市价类记录里。',
          })}
        </p>
        <div className={Styles.footer}>
          <Checkbox
            className={Styles.checkbox}
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          >
            <span className={Styles.checkboxLabel}>{t('noMoreTips')}</span>
          </Checkbox>
          <button type="button" className={Styles.confirmBtn} onClick={handleGotIt}>
            {t('iGotIt', { defaultValue: '我知道了' })}
          </button>
        </div>
      </div>
    </Modal>
  );
};

ConditionOrderTips.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ConditionOrderTips;
