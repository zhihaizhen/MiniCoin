import { useState } from 'react';

export enum ScreenType {
  BIG = '1800px',
  NORMAL = '1264-1800px',
  MIDDLE = '720-1264px',
  SMALL = '375-720px'
}

const useScreen = function () {
  const [screenType, setScreenType] = useState<ScreenType>();
  function updateScreenType() {
    const diffWidth720 = window.innerWidth - 720;
    if (diffWidth720 < 0) setScreenType(ScreenType.SMALL);
    else if (diffWidth720 < 544) setScreenType(ScreenType.MIDDLE);
    else if (diffWidth720 < 1080) setScreenType(ScreenType.NORMAL);
    else setScreenType(ScreenType.BIG);
  }

  return {
    screenType,
    updateScreenType
  };
};

export default useScreen;
