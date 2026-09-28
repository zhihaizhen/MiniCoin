import React from 'react';
import { useFm } from '@better-bit-fe/base-hooks';
import styles from '../../pages/proofOfReserves/index.module.less';

interface AuditDateDropdownProps {
  auditDate: string;
  auditDateOptions: string[];
  isDropdownOpen: boolean;
  isMobileDevice: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onToggle: () => void;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export function AuditDateDropdown({
  auditDate,
  auditDateOptions,
  isDropdownOpen,
  isMobileDevice,
  dropdownRef,
  onToggle,
  onSelect,
  onClose
}: AuditDateDropdownProps) {
  const t = useFm();

  return (
    <div className={styles.auditDateDropdown} ref={dropdownRef}>
      <div
        className={`${styles.auditDateSelector} ${isDropdownOpen ? styles.open : ''}`}
        onClick={onToggle}
      >
        <span className={styles.auditDateText}>
          {isMobileDevice
            ? auditDate
            : `${t('audit-date')}：${auditDate}`}
        </span>
        <svg
          className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.rotated : ''}`}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3.29 4.96L7 8.67L10.71 4.96L12 6.25L7 11.25L2 6.25L3.29 4.96Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {auditDateOptions.map((dateOption, index) => (
            <div
              key={index}
              className={`${styles.dropdownItem} ${dateOption === auditDate ? styles.selected : ''}`}
              {...(isMobileDevice
                ? {
                  onTouchStart: () => {
                    onSelect(dateOption);
                    onClose();
                  }
                }
                : {
                  onMouseDown: () => {
                    onSelect(dateOption);
                    onClose();
                  }
                }
              )}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.dropdownItemText}>
                {isMobileDevice
                  ? dateOption
                  : `${t('audit-date')}：${dateOption}`}
              </span>
              {dateOption === auditDate && (
                <div className={styles.radioButton}>
                  <div className={styles.radioSelected}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
