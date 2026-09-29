import { TRADE_THEMES } from 'common/packages-biz/global-settings';
import { isMobile } from 'common/utils/utils';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import Preferences from '../Preferences';
import SymbolDetail from './SymbolDetail';
import Style from './index.module.less';

const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const PreferenceNavCommon = ({
  loggedIn,
  theme,

  preferenceModal,
  handleShowSetting,
}) => {
  const [highlightRef, setHighlightRef] = useState(null);

  const guideHighlightRef = useCallback((node) => {
    if (node !== null) {
      setHighlightRef(node);
    }
  }, []);

  return (
    <aside
      ref={guideHighlightRef}
      className={Style.preferNav}
    >
      <SymbolDetail theme={theme} />
      <div className={Style.preferNav__right}>
        <Preferences
          loggedIn={loggedIn}
          preferenceModal={preferenceModal}
          handleShowSetting={handleShowSetting}
        />
      </div>
    </aside>
  );
};

PreferenceNavCommon.defaultProps = {
  loggedIn: undefined,
  theme: TRADE_THEMES.LIGHT,

  handleShowSetting: () => { },
  preferenceModal: undefined,
};

PreferenceNavCommon.propTypes = {
  loggedIn: PropTypes.bool,
  theme: PropTypes.string,

  handleShowSetting: PropTypes.func,
  preferenceModal: PropTypes.element,
};

export default PreferenceNavCommon;
