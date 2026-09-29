// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button, Modal, Switch, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { updateNotificationSetting } from '~/api';
import { INotificationSwitches } from '~/types';
import Style from './NotificationModal.module.less';
import { MuTabs } from '@better-bit-fe/base-ui';

// 每个渠道 tab 下的开关配置；children 为可折叠分组
export const CHANNEL_TABS = [
  {
    tabKey: 'email',
    labelKey: 'email',
    items: [
      { labelKey: 'activity-notification', switchKey: 'EMAIL_ACTIVITY' },
      { labelKey: 'asset-notification', switchKey: 'EMAIL_VOUCHER,EMAIL_ASSET' },
      {
        labelKey: 'futures-notification',
        collapsed: true,
        children: [
          { labelKey: 'trade-order', switchKey: 'EMAIL_TP_SL' },
          { labelKey: 'trade-liquidation', switchKey: 'EMAIL_LIQUIDATION' }
        ]
      }
    ]
  },
  {
    tabKey: 'app',
    labelKey: 'app-push',
    items: [
      { labelKey: 'activity-notification', switchKey: 'APP_PUSH_ACTIVITY' },
      {
        labelKey: 'asset-notification',
        switchKey: 'APP_PUSH_VOUCHER,APP_PUSH_ASSET'
      },
      {
        labelKey: 'futures-notification',
        collapsed: true,
        children: [
          { labelKey: 'trade-order', switchKey: 'APP_PUSH_TP_SL' },
          { labelKey: 'trade-liquidation', switchKey: 'APP_PUSH_LIQUIDATION' },
          {
            labelKey: 'quote-push',
            collapsed: false,
            children: [
              { labelKey: 'contract-quote-push', switchKey: 'APP_BC_CONTRACT_QUOTE' },
              { labelKey: 'block-quote-push', switchKey: 'APP_BC_BLOCK_QUOTE' }
            ]
          }
        ]
      }
    ]
  }
];

const splitKeys = (key: string) => key.split(',');

const getChecked = (switches: INotificationSwitches, key: string) =>
  splitKeys(key).some((k) => !!switches[k]);

const collectKeys = (items) =>
  items.flatMap((item) =>
    item.children ? collectKeys(item.children) : splitKeys(item.switchKey)
  );

interface NotificationModalProps {
  open: boolean;
  switches: INotificationSwitches;
  onSaved: (next: INotificationSwitches) => void;
  onClose: () => void;
}

const ArrowIcon = ({ expanded }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.28 6.26L8 9.98L11.72 6.26"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  switches,
  onSaved,
  onClose
}) => {
  const t = useFm();
  const [draft, setDraft] = useState<INotificationSwitches>({});
  const [collapsedMap, setCollapsedMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(CHANNEL_TABS[0].tabKey);

  useEffect(() => {
    if (open) {
      setDraft({ ...switches });
      setActiveTab(CHANNEL_TABS[0].tabKey);
      // 合约通知默认折叠，行情推送默认展开
      const initial = {};
      CHANNEL_TABS.forEach((tab) =>
        tab.items.forEach((item) => {
          if (item.children) {
            initial[`${tab.tabKey}-${item.labelKey}`] = !!item.collapsed;
            item.children.forEach((child) => {
              if (child.children) {
                initial[`${tab.tabKey}-${child.labelKey}`] = !!child.collapsed;
              }
            });
          }
        })
      );
      setCollapsedMap(initial);
    }
  }, [open, switches]);

  const handleToggle = (key: string, checked: boolean) => {
    setDraft((prev) => {
      const next = { ...prev };
      splitKeys(key).forEach((k) => {
        next[k] = checked;
      });
      return next;
    });
  };

  const toggleCollapse = (mapKey: string) => {
    setCollapsedMap((prev) => ({ ...prev, [mapKey]: !prev[mapKey] }));
  };

  const handleConfirm = async () => {
    const allKeys = CHANNEL_TABS.flatMap((tab) => collectKeys(tab.items));
    const changedKeys = allKeys.filter((k) => !!draft[k] !== !!switches[k]);
    if (!changedKeys.length) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        changedKeys.map((key) =>
          updateNotificationSetting({
            notification_type: key,
            notification_switch: !!draft[key]
          })
        )
      );
      message.success(t('setupTips'));
      onSaved(draft);
      onClose();
    } catch {
      // 保存失败保持弹窗打开
    } finally {
      setSaving(false);
    }
  };

  const renderItems = (tabKey, items, level = 0) =>
    items.map((item) => {
      if (item.children) {
        const mapKey = `${tabKey}-${item.labelKey}`;
        const collapsed = collapsedMap[mapKey];
        return (
          <div className={Style.group} key={mapKey}>
            <div
              className={Style.groupHeader}
              onClick={() => toggleCollapse(mapKey)}
            >
              <span className={Style.label}>{t(item.labelKey)}</span>
              <ArrowIcon expanded={!collapsed} />
            </div>
            {!collapsed && (
              <div className={Style.groupBody}>
                {renderItems(tabKey, item.children, level + 1)}
              </div>
            )}
          </div>
        );
      }
      return (
        <div className={Style.switchRow} key={`${tabKey}-${item.switchKey}`}>
          <span className={Style.label}>{t(item.labelKey)}</span>
          <Switch
            checked={getChecked(draft, item.switchKey)}
            onChange={(checked) => handleToggle(item.switchKey, checked)}
          />
        </div>
      );
    });

  const activeChannel =
    CHANNEL_TABS.find((tab) => tab.tabKey === activeTab) ?? CHANNEL_TABS[0];

  return (
    <Modal
      open={open}
      title={t('notification-setting', 'Notification Settings')}
      onCancel={onClose}
      width={424}
      className={Style.notificationModal}
      destroyOnClose
      maskClosable={false}
      footer={
        <div className={Style.btnRow}>
          <Button className={Style.secondaryButton} onClick={onClose}>{t('cancel')}</Button>
          <Button className={Style.primaryButton} loading={saving} onClick={handleConfirm}>
            {t('confirmBtn')}
          </Button>
        </div>
      }
    >
      <MuTabs
        wrapperCls={Style.headerTabs}
        className={Style.tabNav}
        size="small"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(String(key))}
        items={CHANNEL_TABS.map((tab) => ({
          key: tab.tabKey,
          label: t(tab.labelKey)
        }))}
      />
      <div className={Style.switchList}>
        {renderItems(activeChannel.tabKey, activeChannel.items)}
      </div>
    </Modal>
  );
};

export default NotificationModal;
