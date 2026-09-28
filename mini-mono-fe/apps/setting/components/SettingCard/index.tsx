// @ts-nocheck
import React from 'react';
import Style from './index.module.less';

interface SettingCardProps {
  title: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

const SettingCard: React.FC<SettingCardProps> = ({ title, extra, children }) => {
  return (
    <div className={Style.card}>
      <div className={Style.cardHeader}>
        <span className={Style.cardTitle}>{title}</span>
        {extra}
      </div>
      <div className={Style.cardBody}>{children}</div>
    </div>
  );
};

interface SettingRowProps {
  label: string;
  desc?: string;
  className?: string;
  children?: React.ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({ label, desc, className, children }) => {
  return (
    <div className={`${Style.row}${className ? ` ${className}` : ''}`}>
      <div className={Style.rowInfo}>
        <span className={Style.rowLabel}>{label}</span>
        {desc && <span className={Style.rowDesc}>{desc}</span>}
      </div>
      <div className={Style.rowAction}>{children}</div>
    </div>
  );
};

export default SettingCard;
