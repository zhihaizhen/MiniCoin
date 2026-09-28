import React from 'react';
import { Radio } from 'antd';
import styles from './index.module.less';

export interface SubTab {
  key: string;
  label: string;
}

interface SubTabsProps {
  tabs: SubTab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export const SubTabs: React.FC<SubTabsProps> = ({ tabs, activeKey, onChange }) => {
  return (
    <Radio.Group
      value={activeKey}
      onChange={(e) => onChange(e.target.value)}
      className={styles.subTabs}
    >
      {tabs.map(tab => (
        <Radio.Button
          key={tab.key}
          value={tab.key}
          className={tab.key === activeKey ? styles.buttonChecked : styles.button}
        >
          {tab.label}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};
