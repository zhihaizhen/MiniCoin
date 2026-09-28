import { saveDoubleConfirm } from '@/services/user.service';
import { types, useGlobalState } from '@/store';
// import pushEvent from '@region/by-gtm';
import { USER_SETTINGS } from 'common/packages-biz/global-settings';
import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import SettingItem from './SettingItem';
import Style from './setting.module.less'

const AudioSetting = () => {
  const [globalState, globalDispatch] = useGlobalState();
  const [t] = useTranslation();
  const { user } = globalState;
  const defaultDoubleConfirmList = user?.info?.double_confirm?.split(',') ?? [];
  const [audioList, setAudioList] = useState(defaultDoubleConfirmList);

  /**
   * update double confirm settings
   */
  const handleConfirmationSettingClick = (c, eventLabel) => {
    const i = audioList.indexOf(c);
    let n;
    if (i === -1) {
      n = [...audioList, c];
    } else {
      n = audioList.filter((x) => x !== c);
    }
    setAudioList(n);
    saveDoubleConfirm(n).then(() => {
      globalDispatch({
        type: types.UPDATE_ORDER_CONFIRM,
        newDoubleConfirm: n.join(','),
      });
    });
  };

  const AudioSettingsMap = [
    {
      title: t('audioSound'),
      // desc: t('audioSoundTips'),
      toggleVal: audioList.indexOf(USER_SETTINGS.SUCCESS_AUDIO) !== -1,
      changeFunc: () =>
        handleConfirmationSettingClick(
          USER_SETTINGS.SUCCESS_AUDIO,
          'success_audio',
        ),
    },
  ];
  return (
    <For each="audioSetting" of={AudioSettingsMap}>
      <SettingItem
        data={audioSetting}
        key={audioSetting.title}
        className={`${Style["setting-sub-title"]} ${Style["setting-audio"]}`}
      />
    </For>
  );
};

AudioSetting.defaultProps = {};

AudioSetting.propTypes = {};

export default AudioSetting;
