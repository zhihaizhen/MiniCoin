import { storage } from 'by-storage';
import { EditOutlined } from '@ant-design/icons';
import { message, Popover } from 'antd';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLang } from 'common/utils/storageData';
import { KLINE_PINNED_RESOLUTIONS_KEY } from 'common/packages-biz/global-settings/localStorageSettings';
import {
  ALL_RESOLUTION_OPTIONS,
  DEFAULT_PINNED_RESOLUTIONS,
  MAX_PINNED_RESOLUTIONS,
} from './constants';
import styles from './index.module.less';

const ResolutionPickerPanel = ({
  currentResolution,
  pinnedResolutions,
  onSelect,
  onPinnedChange,
  visible,
}) => {
  const [t] = useTranslation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftPinnedResolutions, setDraftPinnedResolutions] = useState([]);
  const isCN = getLang() === 'zh-CN';

  useEffect(() => {
    if (!visible) {
      setIsEditMode(false);
      setDraftPinnedResolutions([]);
    }
  }, [visible]);

  const displayPinnedResolutions = isEditMode
    ? draftPinnedResolutions
    : pinnedResolutions;

  const pinnedSet = useMemo(
    () => new Set(displayPinnedResolutions),
    [displayPinnedResolutions],
  );

  const enterEditMode = () => {
    setDraftPinnedResolutions([...pinnedResolutions]);
    setIsEditMode(true);
  };

  const handleReset = () => {
    setDraftPinnedResolutions([...DEFAULT_PINNED_RESOLUTIONS]);
  };

  const handleSave = () => {
    storage.set(
      KLINE_PINNED_RESOLUTIONS_KEY,
      JSON.stringify(draftPinnedResolutions),
    );
    onPinnedChange(draftPinnedResolutions);
    setIsEditMode(false);
  };

  const handleItemClick = (item) => {
    if (isEditMode) {
      if (pinnedSet.has(item.res)) {
        setDraftPinnedResolutions((prev) =>
          prev.filter((res) => res !== item.res),
        );
        return;
      }
      if (draftPinnedResolutions.length >= MAX_PINNED_RESOLUTIONS) {
        message.warning(t('maxPinnedResolution', '最多选择6个周期'));
        return;
      }
      setDraftPinnedResolutions((prev) => [...prev, item.res]);
      return;
    }
    onSelect(item);
  };

  return (
    <div className={styles.resolutionPicker}>
      <div className={styles.header}>
        <span className={styles.title}>{t('selectPeriod', '选择周期')}</span>
        {isEditMode ? (
          <div className={styles.headerActions}>
            <span className={styles.resetBtn} onClick={handleReset}>
              {t('reset', '重置')}
            </span>
            <span className={styles.saveBtn} onClick={handleSave}>
              {t('save', '保存')}
            </span>
          </div>
        ) : (
          <span className={styles.editBtn} onClick={enterEditMode}>
            <EditOutlined />
            {t('edit', '编辑')}
          </span>
        )}
      </div>
      <div className={`${styles.grid} ${isEditMode ? styles.editMode : ''}`}>
        {ALL_RESOLUTION_OPTIONS.map((item) => {
          const isPinned = pinnedSet.has(item.res);
          const isActive = !isEditMode && item.res === currentResolution;
          return (
            <div
              key={item.res}
              className={[
                styles.item,
                isPinned ? styles.pinned : '',
                isActive ? styles.active : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleItemClick(item)}
            >
              {isCN ? item.full : t(item.fullKey, item.full)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

ResolutionPickerPanel.propTypes = {
  currentResolution: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pinnedResolutions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  onPinnedChange: PropTypes.func.isRequired,
  visible: PropTypes.bool,
};

ResolutionPickerPanel.defaultProps = {
  currentResolution: undefined,
  visible: false,
};

const ResolutionPicker = ({
  currentResolution,
  pinnedResolutions,
  onSelect,
  onPinnedChange,
  onVisibleChange,
  getPopupContainer,
  children,
}) => {
  const [visible, setVisible] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
    onVisibleChange?.(false);
  };

  const handleVisibleChange = (nextVisible) => {
    setVisible(nextVisible);
    onVisibleChange?.(nextVisible);
  };

  return (
    <Popover
      overlayClassName="resolution-picker-popover"
      content={
        <ResolutionPickerPanel
          currentResolution={currentResolution}
          pinnedResolutions={pinnedResolutions}
          onSelect={handleSelect}
          onPinnedChange={onPinnedChange}
          visible={visible}
        />
      }
      trigger="hover"
      placement="bottomLeft"
      visible={visible}
      onVisibleChange={handleVisibleChange}
      getPopupContainer={getPopupContainer}
      showArrow={false}
    >
      {children}
    </Popover>
  );
};

ResolutionPicker.propTypes = {
  currentResolution: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pinnedResolutions: PropTypes.arrayOf(PropTypes.string).isRequired,
  onSelect: PropTypes.func.isRequired,
  onPinnedChange: PropTypes.func.isRequired,
  onVisibleChange: PropTypes.func,
  getPopupContainer: PropTypes.func,
  children: PropTypes.node,
};

ResolutionPicker.defaultProps = {
  currentResolution: undefined,
  onVisibleChange: undefined,
  getPopupContainer: undefined,
  children: null,
};

export default ResolutionPicker;
