// import pushEvent from '@region/by-gtm';
import classNames from 'classnames';
import { isDex, } from 'common/utils/env';
import { handleLoginUrl } from 'common/utils/url';
import PropTypes from 'prop-types';
import React from 'react';
import { useGlobalState } from '@/store';
import { ReactComponent as SettingIcon } from 'common/assets/images/setting.svg';

function Preferences({ loggedIn, preferenceModal, handleShowSetting }) {
  const [globalState] = useGlobalState(); 
  const handleSetClick = () => {
    // pushEvent('click', `watch_set`, '');
    if (!loggedIn) {
      handleLoginUrl();
      return;
    }
    handleShowSetting();
  };

  return (
    <>
      <div
        className={classNames('f-20', 'icon', 'iconfont')}
        onClick={handleSetClick}
        data-coachmark-step="setting-icon"
      >
        <SettingIcon />
      </div>
      {preferenceModal}
    </>
  );
}
Preferences.defaultProps = {
  loggedIn: undefined,
  handleShowSetting: () => { },
  preferenceModal: undefined,
};

Preferences.propTypes = {
  loggedIn: PropTypes.bool,
  handleShowSetting: PropTypes.func,
  preferenceModal: PropTypes.element,
};

export default Preferences;
