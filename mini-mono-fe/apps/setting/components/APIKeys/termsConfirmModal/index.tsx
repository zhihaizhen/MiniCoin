import React, { useEffect, useMemo } from 'react';
import { Modal } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import styles from './index.module.less';

interface TermsConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const TermsConfirmModal: React.FC<TermsConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel
}) => {
  const t = useFm();

  // 根据当前语言获取对应的 API 条款链接
  const API_TERMS_URL = useMemo(() => {
    const currentLang = getLang();
    // 中文使用中文链接，其他语言使用英文链接
    if (currentLang === 'zh-CN') {
      return 'https://easicoin.zendesk.com/hc/zh-cn/articles/14843102559503';
    }
    return 'https://easicoin.zendesk.com/hc/en-us/articles/14843101133455';
  }, []);

  // 处理条款链接点击
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('link')) {
        e.preventDefault();
        window.open(API_TERMS_URL, '_blank', 'noopener,noreferrer');
      }
    };

    const description = document.querySelector(`.${styles.description}`);
    if (description) {
      description.addEventListener('click', handleLinkClick);
    }

    return () => {
      if (description) {
        description.removeEventListener('click', handleLinkClick);
      }
    };
  }, [visible, API_TERMS_URL]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={440}
      centered
      className={styles.termsConfirmModal}
      closable={false}
      maskClosable={false}
    >
      <div className={styles.modalContent}>
        {/* 图标 */}
        <div className={styles.iconSection}>
          <img
            src={basePath + '/images/tips-icon.png'}
            alt="tips"
            width={120}
            height={120}
          />
        </div>

        {/* 标题和描述 */}
        <div className={styles.textSection}>
          <div className={styles.title}>{t('api-terms-title')}</div>
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: t('api-terms-description') }}
          />
        </div>

        {/* 按钮组 */}
        <div className={styles.buttonGroup}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {t('api-terms-cancel')}
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {t('api-terms-confirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TermsConfirmModal;

