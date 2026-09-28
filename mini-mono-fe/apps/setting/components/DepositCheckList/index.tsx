// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button, Modal, Radio, message } from 'antd';
import { getWalletSetting, setWalletSetting } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import SettingCard, { SettingRow } from '~/components/SettingCard';
import { ReactComponent as CloseIcon } from '~/public/images/accountSafe/close.svg';
import Style from './index.module.less';

const WALLET_LABEL_KEYS = {
  FUNDING: 'deposits-to-funding',
  TRADING: 'deposits-to-trading',
  SPOT: 'deposits-to-spot'
};

const DepositWallet: React.FC = () => {
  const t = useFm();
  const [wallet, setWallet] = useState('');
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const response = await getWalletSetting();
      setWallet(response?.wallet_name);
    }
    fetchData();
  }, []);

  const handleOpen = () => {
    setDraft(wallet);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await setWalletSetting({ wallet_name: draft });
      setWallet(draft);
      message.success(t('setupTips'));
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingCard title={t('deposit-account-setting', 'Deposit Account Settings')}>
      <SettingRow label={t('deposit-setting', 'Deposit Settings')}>
        {wallet && (
          <span className={Style.currentValue}>
            {t(WALLET_LABEL_KEYS[wallet])}
          </span>
        )}
        <Button className={Style.secondaryButton} type="primary" onClick={handleOpen}>{t('manage', 'Manage')}</Button>
      </SettingRow>

      <Modal
        open={open}
        title={null}
        closable={false}
        onCancel={handleClose}
        width={424}
        maskClosable={false}
        className={Style.depositModal}
        footer={
          <div className={Style.btnRow}>
            <Button className={Style.secondaryButton} type="primary" onClick={handleClose}>{t('cancel')}</Button>
            <Button className={Style.primaryButton} type="primary" loading={saving} onClick={handleConfirm}>
              {t('confirmBtn')}
            </Button>
          </div>
        }
      >
        <div className={Style.modalHead}>
          <h3 className={Style.modalTitle}>
            {t('deposit-account-setting', 'Deposit Account Settings')}
          </h3>
          <button
            type="button"
            className={Style.closeBtn}
            aria-label="close"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        </div>
        <Radio.Group
          className={Style.modalBody}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        >
          <Radio value="FUNDING">{t('deposits-to-funding')}</Radio>
          <Radio value="TRADING" className={Style.optionWithDesc}>
            <div className={Style.optionLabel}>
              <span>{t('deposits-to-trading')}</span>
              <span className={Style.des}>{t('futures-deposit-tips')}</span>
            </div>
          </Radio>
          <Radio value="SPOT">{t('deposits-to-spot')}</Radio>
        </Radio.Group>
      </Modal>
    </SettingCard>
  );
};

export default DepositWallet;
