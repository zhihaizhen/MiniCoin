// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Switch } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { getNotificationSettings, updateNotificationSetting } from '~/api';
import { INotificationSwitches } from '~/types';
import SettingCard, { SettingRow } from '~/components/SettingCard';
import NotificationModal, { CHANNEL_TABS } from './NotificationModal';
import TradeCheckList from '~/components/TradeCheckList';
import Style from '~/components/Profile/index.module.less';

const splitKeys = (key: string) => key.split(',');

const collectKeys = (items) =>
  items.flatMap((item) =>
    item.children ? collectKeys(item.children) : splitKeys(item.switchKey)
  );

// 邮件 / APP 推送渠道的全部开关 key，外层开关是渠道总开关
const CHANNEL_KEYS = {
  email: collectKeys(CHANNEL_TABS.find((tab) => tab.tabKey === 'email').items),
  app: collectKeys(CHANNEL_TABS.find((tab) => tab.tabKey === 'app').items)
};

const Notification: React.FC = ({ userInfo }) => {
  const t = useFm();
  const [switches, setSwitches] = useState<INotificationSwitches>({});
  const [loading, setLoading] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [orderConfirmOpen, setOrderConfirmOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getNotificationSettings()
      .then((res) => {
        setSwitches(res?.notification_switches || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // 渠道总开关：任一细分开关打开则为打开；切换时批量更新该渠道全部开关
  const handleChannelToggle = useCallback(
    async (channel: 'email' | 'app', checked: boolean) => {
      const keys = CHANNEL_KEYS[channel];
      setSwitches((prev) => {
        const next = { ...prev };
        keys.forEach((k) => {
          next[k] = checked;
        });
        return next;
      });
      try {
        await updateNotificationSetting({
          notification_type: keys.join(','),
          notification_switch: checked
        });
      } catch {
        setSwitches((prev) => {
          const next = { ...prev };
          keys.forEach((k) => {
            next[k] = !checked;
          });
          return next;
        });
      }
    },
    []
  );

  const isChannelOn = (channel: 'email' | 'app') =>
    CHANNEL_KEYS[channel].some((k) => !!switches[k]);

  return (
    <SettingCard
      title={t('notification-setting', 'Notification Settings')}
      extra={
        <Button className={Style.secondaryButton} type="primary" onClick={() => setManageOpen(true)}>
          {t('manage', 'Manage')}
        </Button>
      }
    >
      <SettingRow
        label={t('email')}
        desc={t(
          'notification-channel-des',
          'Get notified via email or app push when changes occur.'
        )}
      >
        <Switch
          checked={isChannelOn('email')}
          loading={loading}
          onChange={(checked) => handleChannelToggle('email', checked)}
        />
      </SettingRow>
      <SettingRow
        label={t('app-push')}
        desc={t(
          'notification-channel-des',
          'Get notified via email or app push when changes occur.'
        )}
      >
        <Switch
          checked={isChannelOn('app')}
          loading={loading}
          onChange={(checked) => handleChannelToggle('app', checked)}
        />
      </SettingRow>
      <SettingRow
        className="mt-6"
        label={t('order-confirm-reminder', 'Order Confirmation Reminder')}
        desc={t('order-confirmation-des')}
      >
        <Button className={Style.secondaryButton} type="primary" onClick={() => setOrderConfirmOpen(true)}>
          {t('manage', 'Manage')}
        </Button>
      </SettingRow>

      <NotificationModal
        open={manageOpen}
        switches={switches}
        onSaved={setSwitches}
        onClose={() => setManageOpen(false)}
      />
      <TradeCheckList
        userInfo={userInfo}
        open={orderConfirmOpen}
        onClose={() => setOrderConfirmOpen(false)}
      />
    </SettingCard>
  );
};

export default Notification;
