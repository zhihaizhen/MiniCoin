//  @ts-nocheck
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useRouter } from 'next/router';
import cls from 'classnames';
import { useFm } from '@better-bit-fe/base-hooks';
import { Divider, Popup, CheckList } from 'antd-mobile';
import { Modal, Button, message } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { CheckOutline } from 'antd-mobile-icons';
import { keepUrlQueryParams } from '~/utils/url';
import { REFERRAL_PATH } from '~/constants/path';
import styles from './index.module.less';
import { useContextReferral } from '~/context/transactionHistoryContext';
import { jumpToUrl } from '~/utils/url';
import { timeFilterList } from '~/constants';
import { commissionWithdrawalSev } from '~/api';
import { numberWithCommas } from '~/utils/format-number';

const defaultSortName = timeFilterList.filter((item) => item.value === 'All')[0]
  .key;

let CommissionSummaryCard = (props, ref) => {
  const t = useFm();
  const router = useRouter();
  const { hasAuth, commissionCardData, getCommissionCardData } =
    useContextReferral();
  const [isOpen, setIsOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [selected, setSelected] = useState('All');
  const [sortName, setSortName] = useState(defaultSortName);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  useImperativeHandle(ref, () => ({
    handleRefresh: () => {
      getCommissionCardData(selected);
    }
  }));

  useEffect(() => {
    if (hasAuth) {
      getCommissionCardData(selected);
    }
  }, [selected, hasAuth]);

  const handleRedirectCommissionDetail = () => {
    // router.push(keepUrlQueryParams(REFERRAL_PATH.commissionHistory));
    jumpToUrl(keepUrlQueryParams(REFERRAL_PATH.commissionHistory));
  };

  const openFilterPopup = () => {
    setFilterPopupVisible(true);
  };

  const closeFilterPopup = () => {
    setFilterPopupVisible(false);
  };

  const showWithdrawModal = () => {
    if (
      !commissionCardData?.commission_balance ||
      numberWithCommas(commissionCardData?.commission_balance) == 0
    ) {
      return;
    }

    setIsOpen(true);
  };

  const handleModalCancel = () => {
    setIsOpen(false);
  };

  const handleModalConfirm = async () => {
    try {
      await commissionWithdrawalSev();
      success();
      setIsOpen(false);
      // 取款之后需要刷新页面
      getCommissionCardData(selected);
    } catch (err) {
      message.error(t('withdrawFailed'));
      setIsOpen(false);
    }
  };

  const success = () => {
    messageApi.open({
      type: 'success',
      content: `${t('withdrawSuccessful')}`,
      className: 'message-success',
      style: {
        marginTop: '20vh'
      },
      duration: 2
    });
  };

  return (
    <div className={styles.referralSummaryCard}>
      <div className={styles.referralSummaryCard_head}>
        <span className={styles.referralSummaryCard_head_title}>
          {t('commission')}
        </span>
        <div
          className={styles.referralSummaryCard_head_time}
          onClick={openFilterPopup}
        >
          <span>{t(`${sortName}`)}</span>
          <span className={styles.referralSummaryCard_head_time_icon} />
        </div>
      </div>

      <div className={styles.referralSummaryCard_container}>
        <div className={styles.referralSummaryCard_row}>
          <div className={styles.referralSummaryCard_info}>
            <div className={styles.referralSummaryCard_info_label}>
              {t('settledCommission')}
            </div>
            <div className={styles.referralSummaryCard_info_value}>
              {numberWithCommas(commissionCardData?.settled_commission)}
            </div>
          </div>
          <div className={styles.referralSummaryCard_info}>
            <div className={styles.referralSummaryCard_info_label}>
              {t('unsettledCommission')}
            </div>
            <div className={styles.referralSummaryCard_info_value_right}>
              {numberWithCommas(commissionCardData?.unsettled_commission)}
            </div>
          </div>
        </div>
        <Divider className={styles.referralSummaryCard_divider} />
        <div className={styles.referralSummaryCard_row}>
          <div className={styles.referralSummaryCard_info}>
            <div className={styles.referralSummaryCard_info_value_bottom}>
              {t('commissionAccBalance')}
            </div>
          </div>
          <div className={styles.referralSummaryCard_info}>
            <div className={styles.referralSummaryCard_info_value_last}>
              <span>
                {numberWithCommas(commissionCardData?.commission_balance)}
              </span>
              <span
                className={cls(styles.referralSummaryCard_info_icon, {
                  [styles.disabled]:
                    !commissionCardData?.commission_balance ||
                    numberWithCommas(commissionCardData?.commission_balance) ==
                    0
                })}
                onClick={showWithdrawModal}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.referralSummaryCard_record}>
        <div className={styles.referralSummaryCard_record_btn}>
          <div
            className={styles.referralSummaryCard_record_btn_text}
            onClick={handleRedirectCommissionDetail}
          >
            {t('commissionTransHistory')}
            <RightOutlined
              className={styles.referralSummaryCard_record_btn_icon}
            />
          </div>
          <div className={styles.referralSummaryCard_record_btn_icon} />
        </div>
      </div>
      {contextHolder}
      <Modal
        title={t('withdrawCommission')}
        open={isOpen}
        onCancel={handleModalCancel}
        footer={null}
        width="420px"
        centered
        wrapClassName={`${styles.modalWrapper} ${styles.cancelCopyModal}`}
      >
        <div>
          <p className={styles.tip}>{t('withdrawTips')}</p>
          <div className={styles.btns}>
            <div
              className={`${styles.cancelBtn} ${styles.flexBothCenter}`}
              onClick={handleModalCancel}
            >
              {t('cancel')}
            </div>

            <Button
              className={`${styles.confirmBtn} ${styles.flexBothCenter}`}
              onClick={handleModalConfirm}
            >
              {t('Withdraw')}
            </Button>
          </div>
        </div>
      </Modal>
      <Popup
        visible={filterPopupVisible}
        onMaskClick={() => {
          setFilterPopupVisible(false);
        }}
        destroyOnClose
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          minHeight: '30vh'
        }}
      >
        <div className={styles.filterPopupContainer}>
          <div className={styles.content}>
            <CheckList
              activeIcon={<CheckOutline color="var(--text-brand-default)" />}
              className={styles.myCheckList}
              defaultValue={selected ? [selected] : []}
              onChange={(val) => {
                const currentVal = val.length === 0 ? selected : val[0];
                setSelected(currentVal);
                setSortName(
                  timeFilterList.filter((item) => item.value === currentVal)[0]
                    .key
                );
                setFilterPopupVisible(false);
              }}
            >
              {timeFilterList.map((item) => (
                <CheckList.Item
                  key={item.key}
                  value={item.value}
                  style={{
                    '--active-background-color': '#222'
                  }}
                >
                  {t(`${item.key}`)}
                </CheckList.Item>
              ))}
            </CheckList>
          </div>
          <div className={styles.btn} onClick={closeFilterPopup}>
            Cancel
          </div>
        </div>
      </Popup>
    </div>
  );
};
CommissionSummaryCard = forwardRef(CommissionSummaryCard);

export default CommissionSummaryCard;
