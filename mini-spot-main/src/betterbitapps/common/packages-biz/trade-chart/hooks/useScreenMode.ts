import React, { useState, useEffect } from 'react';
import { checkFull, toFullScreen, exitFullScreen } from './utils';

export function useScreenMode(domElement: React.RefObject<HTMLDivElement>) {
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const init = () => {
    //  for safari
    window.addEventListener(
      'resize',
      () => {
        // if (fullScreen) {
        //   setTimeout(() => {
        //     if (!checkFull()) {
        //       setFullScreen(false);
        //     }
        //   }, 1000);
        // }
        setTimeout(() => {
          if (!checkFull()) {
            setFullScreen(false);
          }
        }, 1000);
      },
      false,
    );
    // chrome,firefox,ie
    domElement.current?.addEventListener(
      'fullscreenchange',
      (e) => {
        // if (fullScreen && !window.document.fullscreenElement) {
        //   setFullScreen(false);
        // }
        if (!window.document.fullscreenElement) {
          setFullScreen(false);
        }
      },
      false,
    );
  };

  const toggleFullScreen = () => {
    if (fullScreen) {
      exitFullScreen();
    } else {
      toFullScreen(domElement.current);
    }
    setFullScreen(!fullScreen);
  };
  useEffect(() => {
    init();
  }, []);
  return {
    fullScreen,
    toggleFullScreen,
  };
}
