import React, { useState, useEffect } from 'react';
import styles from './index.module.less';
import { useFm } from '@better-bit-fe/base-hooks';
import { formatDateTime } from '../../utils';
import { useRouter } from 'next/router';
import { getVoucherList, convertVoucher } from '../../api';
import clc from 'classnames';
import campaignLang from '../../mini-translation-temp/Campaign.json';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { isInApp } from '~/utils';
import { Drawer, Modal, message } from 'antd';
import { ReactComponent as FailIcon } from '~/public/images/fail.svg';
import { isMobile } from '@better-bit-fe/base-utils';
import { ReactComponent as SuccessIcon } from '~/public/images/message-success.svg';

const Voucher = ({ voucherList, fetchVoucherList }) => {
  const t = useFm();
  const { isLogin } = useUserInfo();
  const { locale } = useRouter();
  const { content } = campaignLang[locale] || {};
  const [openDrawer, setOpenDrawer] = useState(false);
  const [errorTips, setErrorTips] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const voucherStatus = (status) => {
    switch (status) {
      case 'issued':
        return t('go-convert');
      case 'expired':
        return t('expired');
      case 'swaped':
        return t('swaped');
      default:
        return t('go-convert');
    }
  };

  const handleVoucher = (item) => {
    if (item?.status === 'issued') {
      convertVoucher({
        voucher_id: item?.voucher_id
      })
        .then((res) => {
          messageApi.open({
            type: 'success',
            content: t('voucher-convert-success'),
            className: styles.message,
            icon: <SuccessIcon />
          });
          fetchVoucherList();

        })
        .catch((err) => {
          if (isMobile()) {
            setOpenDrawer(true);
          } else {
            setOpenModal(true);
          }
          setErrorTips(t(err?.code));
        });
    }
  };

  const goToNextPage = () => {
    if (isMobile()) {
      setOpenDrawer(false);
    } else {
      setOpenModal(false);
    }
  };
  if (!isLogin || voucherList?.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      {contextHolder}
      <div className={styles.title}>{t('my-voucher')}</div>
      {/* voucherList不为空时展示 */}
      {voucherList?.map((item) => (
        <div className={styles.voucher} key={item.voucher_id}>
          <div className={styles.top}>
            <div className={styles.voucherTitle}>
              <span className={styles.voucherTitleNum}>
                {item?.experience_amount?.toLocaleString()}
              </span>
              <span className={styles.usdt}>{'USDT'}</span>
            </div>
            <div className={styles.description}>
              {`${item?.cash_back_percent}% ${t('voucher')}`}
            </div>
          </div>
          <div className={styles.bottom}>
            <div
              className={clc(styles.voucherbtn, {
                [styles.disabled]: item?.status !== 'issued'
              })}
              onClick={() => handleVoucher(item)}
            >
              {voucherStatus(item?.status)}
            </div>
            <div className={styles.timer}>
              {t('expire-time').replace(
                '{time}',
                formatDateTime(item?.end_at)
              )}
              {/* {`将于 ${formatDateTime(item?.end_at)} 过期`} */}
            </div>
          </div>
        </div>
      ))}
      {/* Drawer在下方弹出 */}
      <Drawer
        title={null}
        height={275}
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        placement="bottom"
        className={styles.drawerWrapper}
      >
        <FailIcon />
        <div className={styles.failTitle}>{t('voucher-error')}</div>
        <div className={styles.failDesc}>{errorTips}</div>
        <div className={styles.failBtn} onClick={goToNextPage}>
          {t('got-it')}
        </div>
      </Drawer>
      <Modal
        width={400}
        open={openModal}
        onCancel={goToNextPage}
        onOk={goToNextPage}
        footer={null}
        className={styles.modalWrapper}
        centered
      >
        <FailIcon />
        <div className={styles.failTitle}>{t('voucher-error')}</div>
        <div className={styles.failDesc}>{errorTips}</div>
        <div className={styles.failBtn} onClick={goToNextPage}>
          {t('got-it')}
        </div>
      </Modal>
    </div>
  );
};

export default Voucher;
