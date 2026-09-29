import { Drawer } from 'antd';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SecondSetting from './SecondSetting';
import AudioSetting from './AudioSetting';
import ColorPreference from './ColorPreference';
import OnboardingEntry from './OnboardingEntry';
import Style from './setting.module.less';

const Setting = ({ showSetting, onResetGrid, onCloseSetting, ...props }) => {
  const [t] = useTranslation();
  const [showConfirm, setShowConfirm] = useState(true);
  const handleShowConfirmSetting = () => {
    setShowConfirm((pre) => !pre);
  };

  return (
    <>
      <If condition={showSetting}>
        <Drawer
          open={showSetting}
          onClose={onCloseSetting}
          className={Style['setting-drawer']}
          title={t('tradePreferSetting')}
          extra={
            <span
              className="icon iconfont icon-close"
              onClick={onCloseSetting}
            />
          }
        >
          <div className={Style['setting-modal__content']}>
            {/* 新手教学：面板第一项，位于 AudioSetting 之前 */}
            <OnboardingEntry onCloseSetting={onCloseSetting} />
            {/* 全局设置 */}
            <div className={Style['setting-modal__block']}>
              <div className={Style['setting-content-desc']}>
                {t('globalValid')}
              </div>
              <div>
                {/* 折叠面板 */}
                <div
                  onClick={handleShowConfirmSetting}
                  className={Style['setting-content-title']}
                >
                  <div>{t('modalConfirmation')}</div>
                  <span className={`icon iconfont ${showConfirm ? 'icon-shang' : 'icon-xia'}`} />
                </div>
                <If condition={showConfirm}>
                  <SecondSetting />
                </If>
              </div>
            </div>
            {/* 全局设置 */}
            <AudioSetting />
            <ColorPreference />
            {/* <ResetGridSetting onResetGrid={onResetGrid} /> */}
          </div>
        </Drawer>
      </If>
    </>
  );
};

Setting.defaultProps = {
  onCloseSetting: undefined,
  showSetting: undefined,
  onResetGrid: () => {},
};

Setting.propTypes = {
  onCloseSetting: PropTypes.func,
  showSetting: PropTypes.bool,
  onResetGrid: PropTypes.func,
};

export default Setting;
