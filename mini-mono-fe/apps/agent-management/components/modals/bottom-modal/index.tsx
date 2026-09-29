import { FC, useEffect, useMemo } from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import { createPortal } from 'react-dom';
import { getRandomId } from './helper';
import styles from './index.module.less';

interface IBottomModalProps {
  show: boolean;
  hasBackground?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: React.ReactNode | string;
}

const BottomModal: FC<IBottomModalProps> = ({
  show,
  onClose = null,
  hasBackground = true,
  children,
  title
}) => {
  const t = useFm();
  const modalEleId = useMemo(() => getRandomId(), []);

  const hasWindow = () => {
    return typeof window === 'object';
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <>
      {show &&
        createPortal(
          <div className={styles.bottomModal_modal}>
            <div className={styles.bottomModal_modal_content}>
              <div
                className={styles.bottomModal_modal_content_mask}
                onClick={handleClose}
              />
              <div className={styles.bottomModal_modal_content_wrapper}>
                {/* <div
            className={styles.bottomModal_modal_close}
            onClick={handleClose}
          /> */}
                <div className={styles.bottomModal_modal_content_body}>
                  {title && (
                    <div className={styles.bottomModal_modal_content_title}>
                      {title}
                    </div>
                  )}
                  <div className={styles.bottomModal_modal_content_children}>
                    {children}
                    <div
                      className={styles.bottomModal_modal_content_btn_cancel}
                      onClick={handleClose}
                    >
                      {t('cancel')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
          modalEleId
        )}
    </>
  );
};

export default BottomModal;
