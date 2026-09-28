import { useMemo } from 'react';

const useAudioHook = (url) => {
  return useMemo(() => {
    let audioObj = null;
    try {
      audioObj = new Audio(url);
    } catch (error) {
      audioObj = null;
    }
    return audioObj;
  }, [url]);
};

export default useAudioHook;
