import React, { useMemo } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import { useFm } from '@better-bit-fe/base-hooks';
import { getRandomId } from '~/utils/share';
import { SocialShareActions } from '@better-bit-fe/base-ui';
import styles from './index.module.less';

const ReferralShareModal = ({
    modalOpen,
    referralInfo,
    onClose,
}: any) => {
    const t = useFm();
    const downloadId = useMemo(() => getRandomId(), []);

    const handleClose = () => {
        onClose?.();
    };

    const handleDownload = () => {
        const target = document.getElementById(downloadId);
        if (!target) return;
        const scale = 1.5;
        const obj = {
            height: target.offsetHeight * scale,
            width: target.offsetWidth * scale,
            style: {
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${target.offsetWidth}px`,
                height: `${target.offsetHeight}px`,
            },
        };
        domtoimage.toPng(target, obj).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `referral_${referralInfo?.inviteCode || ''}.png`;
            link.href = dataUrl;
            link.click();
        });
    };

    return (
        <Modal
            className={styles.modalMask}
            open={modalOpen}
            centered
            maskClosable={false}
            onCancel={handleClose}
            closeIcon={null}
            width={600}
            footer={null}
            keyboard={true}
        >
            <div
                className={styles.referralShareModal}
            >
                <div className={styles.content}>
                    <div className={styles.contentWrapper}>
                        <div className={styles.close} onClick={handleClose} />
                        <div className={styles.body} id={downloadId}>
                            <div className={styles.card}>
                                <div className={styles.cardDesign}>
                                    <div className={styles.logo} />
                                    <div className={styles.content}>
                                        <div className={styles.title} dangerouslySetInnerHTML={{ __html: t('share-text-h5') }} />
                                        <div className={styles.illustration} />
                                    </div>
                                </div>
                                {/* 邀请信息 */}
                                <div className={styles.invite}>
                                    <div className={styles.inviteInfo}>
                                        <div className={styles.descLabel}>{t('share-invite-text')}</div>
                                        <div className={styles.descValue}>{referralInfo?.inviteCode || ''}</div>
                                    </div>
                                    <div className={styles.qrcode}>
                                        <QRCode
                                            size={48}
                                            value={referralInfo?.inviteLink || ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <SocialShareActions
                            inviteLink={referralInfo?.inviteLink}
                            inviteCode={referralInfo?.inviteCode}
                            onDownload={handleDownload}
                        />
                    </div>
                </div>
            </div>
        </Modal >
    );
};

export default ReferralShareModal;
