import React, { useState } from 'react';
import { Modal, Checkbox } from 'antd';
import { FormattedMessage } from 'react-intl';
import { useFm } from '@better-bit-fe/base-hooks';
import { ReactComponent as CloseIcon } from '~/public/icons/close.svg';
import styles from './index.module.less';

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: 'grid' | 'dca';
}

const AGREEMENT_LINKS: Record<string, string> = {
  grid: 'https://easicoin.zendesk.com/hc/zh-cn/articles/15018638849935',
  dca: 'https://easicoin.zendesk.com/hc/zh-cn/articles/16303993177743-%E7%8E%B0%E8%B4%A7%E5%AE%9A%E6%8A%95%E7%AD%96%E7%95%A5%E4%BA%A4%E6%98%93%E7%94%A8%E6%88%B7%E5%8D%8F%E8%AE%AE'
};

const TermsModal: React.FC<TermsModalProps> = ({ open, onClose, onConfirm, type = 'grid' }) => {
  const t = useFm();
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      onConfirm();
      setAgreed(false); // 重置状态
    }
  };

  const handleCancel = () => {
    onClose();
    setAgreed(false); // 重置状态
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closeIcon={<CloseIcon />}
      width={430}
      className={styles.termsModal}
      centered
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        <div className={styles.head}>
          <h3 className={styles.title}>{t('trading-bot-terms')}</h3>
        </div>

        <div className={styles.body}>
          <p className={styles.termsText}>
            <FormattedMessage
              id={type === 'dca' ? 'terms-paragraph-1-dca' : 'terms-paragraph-1'}
              values={{
                agreementLink: (chunks: React.ReactNode) => (
                  <a
                    href={AGREEMENT_LINKS[type]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.termsLink}
                  >
                    {chunks}
                  </a>
                )
              }}
            />
          </p>
          <p className={styles.termsText}>{t('terms-paragraph-2')}</p>
          <div className={styles.checkboxWrapper}>
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={styles.checkbox}
            >
              <span className={styles.checkboxLabel}>{t('terms-agree-checkbox')}</span>
            </Checkbox>
          </div>
        </div>

        <div className={styles.btnGroup}>
          <button
            className={`${styles.confirmBtn} ${!agreed ? styles.disabled : ''}`}
            onClick={handleConfirm}
            disabled={!agreed}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TermsModal;
