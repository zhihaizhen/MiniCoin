/**
 * Preference_Panel「新手教学」入口
 *
 * - New_Tag 由 ONBOARDING_TOUR_ENTRY_VIEWED_KEY 控制，与引导完成态独立存储
 * - 点击后关闭 Drawer，并通过 eventBus 通知 Main 中的 Coachmark 从第 1 步重新开始
 * - 视觉对齐 Figma 27544:66839：标题 + NEW 标签左对齐，右侧 chevron
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { storage } from 'by-storage';
import { eventBus } from 'common/utils/EventBus';
import { ONBOARDING_TOUR_ENTRY_VIEWED_KEY } from 'common/packages-biz/global-settings/localStorageSettings';
import { ReactComponent as ChevronRightSvg } from 'common/assets/images/chevron-right.svg';
import Style from './setting.module.less';

const OnboardingEntry = ({ onCloseSetting }) => {
  const [t] = useTranslation();
  const [entryViewed, setEntryViewed] = useState(
    () => !!storage.get(ONBOARDING_TOUR_ENTRY_VIEWED_KEY),
  );

  const handleReplay = () => {
    if (!entryViewed) {
      try {
        storage.set(ONBOARDING_TOUR_ENTRY_VIEWED_KEY, '1');
      } catch (e) {
        // storage 不可用时仍允许重新观看
      }
      setEntryViewed(true);
    }
    // 先关闭 Drawer，避免遮挡高亮层
    onCloseSetting?.();
    eventBus.emit('onboardingTour:restart');
  };

  return (
    <div
      className={Style['onboarding-entry']}
      onClick={handleReplay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleReplay();
        }
      }}
    >
      <div className={Style['onboarding-entry__main']}>
        <span className={Style['onboarding-entry__title']}>
          {t('onboardingEntryTitle', {
            defaultValue: '新手教学',
          })}
        </span>
        {!entryViewed && (
          <span className={Style['new-tag']}>
            {t('trade-share:new', { defaultValue: 'NEW' })}
          </span>
        )}
      </div>
      <ChevronRightSvg className={Style['onboarding-entry__chevron']} />
    </div>
  );
};

OnboardingEntry.defaultProps = {
  onCloseSetting: undefined,
};

OnboardingEntry.propTypes = {
  onCloseSetting: PropTypes.func,
};

export default OnboardingEntry;
