import React, { useMemo, useCallback } from 'react';
import { Modal } from 'antd';
import { isMobile } from '@better-bit-fe/base-utils';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as WarnIcon } from '~/public/images/ip-restrict-warn.svg';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import styles from './index.module.less';

interface IpRestrictModalProps {
  visible: boolean;
  onClose: () => void;
  countryName?: string;
}

const IpRestrictModal: React.FC<IpRestrictModalProps> = ({ visible, onClose, countryName = '' }) => {
  const isMb = useMemo(() => isMobile(), []);
  const t = useFm();

  const handleAfterClose = useCallback(() => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.touchAction = '';
  }, []);

  if (isMb) {
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        closable={false}
        maskClosable={false}
        destroyOnClose
        afterClose={handleAfterClose}
        className={styles.ipRestrictModalH5}
        wrapClassName={styles.ipRestrictWrapH5}
        width="100%"
        style={{ top: 'auto', bottom: 0, margin: 0, padding: 0, maxWidth: '100%' }}
      >
        <div className={styles.draggerHead}>
          <div className={styles.dragger} />
        </div>
        <div className={styles.contentH5}>
          <div className={styles.iconWrap}>
            <WarnIcon className={styles.warnIcon} />
          </div>
          <div className={styles.body}>
            <div className={styles.titleH5}>{t('ip-restrict-title')}</div>
            <div className={styles.descH5}>{t('ip-restrict-content', { country: countryName })}</div>
          </div>
        </div>
        <div className={styles.bottomH5}>
          <button className={styles.btnH5} onClick={onClose}>
            {t('ip-restrict-btn')}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={440}
      className={styles.ipRestrictModal}
    >
      <div className={styles.closeBtn} onClick={onClose}>
        <CloseIcon />
      </div>
      <div className={styles.contentPC}>
        <div className={styles.iconWrap}>
          <WarnIcon className={styles.warnIcon} />
        </div>
        <div className={styles.body}>
          <div className={styles.titlePC}>{t('ip-restrict-title')}</div>
          <div className={styles.descPC}>{t('ip-restrict-content', { country: countryName })}</div>
        </div>
      </div>
      <button className={styles.btnPC} onClick={onClose}>
        {t('ip-restrict-btn')}
      </button>
    </Modal>
  );
};

export default IpRestrictModal;
