import { PreferenceNavCommon } from 'common/components';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import useUserStore from '@/store-hooks/use-user-store';
import { useGlobalState } from '@/store';
import Setting from '@/components/Setting';

const PreferenceNav = ({ onResetGrid }) => {
  const [globalState] = useGlobalState();
  const { currentTheme } = globalState;
  const { loggedIn } = useUserStore();

  const [showSetting, setShowSetting] = useState(false);
  const closeSetting = useCallback(() => {
    setShowSetting(false);
  }, []);

  const handleShowSetting = useCallback(() => {
    setShowSetting(true);
  }, []);

  const preferenceSetting = useMemo(
    () => (
      <Setting
        showSetting={showSetting}
        onCloseSetting={closeSetting}
        onResetGrid={onResetGrid}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showSetting],
  );

  const preferenceNavCommonProps = {
    loggedIn,
    theme: currentTheme,
    handleShowSetting,
    preferenceModal: preferenceSetting,
  };

  return (
    <PreferenceNavCommon
      {...preferenceNavCommonProps}
    />
  );
};

PreferenceNav.defaultProps = {
  onResetGrid: () => { },
};

PreferenceNav.propTypes = {
  onResetGrid: PropTypes.func,
};

export default PreferenceNav;
