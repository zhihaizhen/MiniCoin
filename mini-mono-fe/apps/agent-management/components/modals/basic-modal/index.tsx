import { FC, useMemo } from 'react';
import { createPortal } from 'react-dom';
import cls from 'classnames';
import { getRandomId } from './helper';
import styles from './index.module.less';

interface IBasicModalProps {
  show: boolean;
  hasBackground?: boolean;
  hasPadding?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  title?: React.ReactNode | string;
}

const BasicModal: FC<IBasicModalProps> = ({
  show,
  onClose = null,
  hasBackground = true,
  hasPadding = true,
  children,
  title
}) => {
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
          <div className={styles.basicModal_modal}>
            <div className={styles.basicModal_modal_content}>
              <div className={styles.basicModal_modal_content_wrapper}>
                <div
                  className={styles.basicModal_modal_close}
                  onClick={handleClose}
                />
                <div
                  className={cls(styles.basicModal_modal_content_body, {
                    [styles.no_bg]: !hasBackground,
                    [styles.no_padding]: !hasPadding
                  })}
                >
                  {title && (
                    <div
                      className={cls(styles.basicModal_modal_content_title, {
                        [styles.no_bg]: !hasBackground
                      })}
                    >
                      {title}
                    </div>
                  )}
                  <div className={styles.basicModal_modal_content_children}>
                    {children}
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

export default BasicModal;
