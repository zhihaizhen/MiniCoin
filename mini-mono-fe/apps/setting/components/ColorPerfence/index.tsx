// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button, Modal, Radio, Space, message } from 'antd';
import { useFm } from '@better-bit-fe/base-hooks';
import { useRouter } from 'next/router';
import { trade_color_lang_map, addCandleThemeData } from '@better-bit-fe/base-utils';
import { ReactComponent as GreenUpRedDown } from '~/public/images/setting/greenUpRedDown.svg';
import { ReactComponent as RedUpBlueDown } from '~/public/images/setting/redUpBlueDown.svg';
import { ReactComponent as RedUpGreenDown } from '~/public/images/setting/redUpGreenDown.svg';
import SettingCard, { SettingRow } from '~/components/SettingCard';
import Style from './index.module.less';

const COLOR_OPTIONS = [
  { value: 'greenUpRedDown', Icon: GreenUpRedDown },
  { value: 'redUpGreenDown', Icon: RedUpGreenDown },
  { value: 'redUpBlueDown', Icon: RedUpBlueDown }
];

const ColorPerfence: React.FC = () => {
  const t = useFm();
  const [colorPreference, setColorPreference] = useState('');
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);
  const { locale } = useRouter();

  // 初始是根据用户语言来设置颜色偏好
  useEffect(() => {
    const v = localStorage.getItem('TRADE_COLOR_PREFERENCE');
    const initColor = v || trade_color_lang_map[locale] || trade_color_lang_map.default;
    setColorPreference(initColor);
    addCandleThemeData(initColor);
  }, []);

  const handleOpen = () => {
    setDraft(colorPreference);
    setOpen(true);
  };

  const handleConfirm = () => {
    localStorage.setItem('TRADE_COLOR_PREFERENCE', draft);
    setColorPreference(draft);
    addCandleThemeData(draft);
    message.success(t('setupTips'));
    setOpen(false);
  };

  const current = COLOR_OPTIONS.find((o) => o.value === colorPreference);

  return (
    <SettingCard title={t('preference-setting', 'Preferences')}>
      <SettingRow label={t('color-preference')}>
        {current && (
          <span className={Style.currentValue}>
            <current.Icon />
            <span>{t(current.value)}</span>
          </span>
        )}
        <Button className={Style.secondaryButton} type="primary" onClick={handleOpen}>
          {t('action-edit')}
        </Button>
      </SettingRow>

      <Modal
        open={open}
        title={t('color-preference')}
        onCancel={() => setOpen(false)}
        width={424}
        className={Style.colorModal}
        footer={
          <div className={Style.btnRow}>
            <Button className={Style.secondaryButton} type="primary" onClick={() => setOpen(false)}>{t('cancel')}</Button>
            <Button className={Style.primaryButton} type="primary" onClick={handleConfirm}>
              {t('confirmBtn')}
            </Button>
          </div>
        }
      >
        <Radio.Group className="mt-4!" onChange={(e) => setDraft(e.target.value)} value={draft}>
          <Space direction="vertical">
            {COLOR_OPTIONS.map(({ value, Icon }) => (
              <Radio value={value} key={value}>
                <div className={Style.radioItem}>
                  <Icon />
                  <span>{t(value)}</span>
                </div>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
    </SettingCard>
  );
};

export default ColorPerfence;
