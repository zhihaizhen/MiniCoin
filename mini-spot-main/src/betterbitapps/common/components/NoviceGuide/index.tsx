import React, { useEffect, useState } from 'react';
import { storage } from 'by-storage';
import { getToken, getLang } from 'common/utils/storageData';
import { useGlobalState } from '@/store';
import './style.less';
import { Forward, Inverse } from './scene';

interface NoviceGuideProps {
  scene: string;
}

export const NoviceGuide = ({ scene = 'forward' }: NoviceGuideProps) => {
  const [iniLoaded, setIniLoaded] = useState(false);
  const [state] = useGlobalState();
  // isShowPrompt true 显示新手引导弹窗
  const [isShowPrompt, setIsShowPrompt] = useState(false);
  const localKey: string = 'trade_novice_guide_not_prompt_forward';
  const loadedPosition = state.position?.positionList.loaded;

  useEffect(() => {
    // console.log('---检查登录情况', !getToken());
    if (!getToken()) {
      checkLocalPrompt();
    }
  }, []);

  // 检查本地缓存与持仓情况，(本地过期 || 无缓存) && 无持仓 则显示弹窗
  useEffect(() => {
    if (iniLoaded) {
      return;
    }
    if (loadedPosition) {
      const isExist = state.position?.positionList.list.some(
        (item: { size: number }) => item.size > 0,
      );

      if (isExist) {
        // setIsShowPrompt(false);
      } else {
        // 查询持仓后，查询本地
        checkLocalPrompt();
      }

      setIniLoaded(true);
    }
  }, [loadedPosition]);

  const checkLocalPrompt = () => {
    const localNotPrompt = storage.get(localKey);
    if (localNotPrompt && new Date().getTime() - localNotPrompt < 1209600000) {
      // 14 天内不显示
      setIsShowPrompt(false);
    } else {
      setIsShowPrompt(true);
    }
  };

  const closeDialog = (notAgain: boolean = false) => {
    // 写入时间戳
    storage.set(localKey, notAgain ? new Date().getTime() : '');
    setIsShowPrompt(false);
  };

  const handleClickDialogBg = (e: any) => {
    if (
      e.target.className &&
      e.target.className.indexOf('novice-guide-dialog') > -1
    ) {
      setIsShowPrompt(false);
    }
  };

  const getScene = () => {
    if (scene === 'forward') {
      return <Forward close={closeDialog} />;
    }
    return <Inverse close={closeDialog} />;
  };

  if (!isShowPrompt) {
    return null;
  }

  // 针对不同场景(正/反向合约)导入不同的引导动画
  return (
    <div
      className={`novice-guide-dialog ${getLang() === 'ko-KR' ? 'kr' : 'en'}`}
      onClick={handleClickDialogBg}
    >
      <div className="content">{getScene()}</div>
    </div>
  );
};

export default NoviceGuide;
