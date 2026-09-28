import { useMemo } from 'react';

const useAudioHook = (url) => {
  return useMemo(() => {
    let audioObj = null;
    try {
      console.log('Creating new Audio instance for:', url);
      audioObj = new Audio(url);
      // Add event listeners to track when audio would play
      audioObj.addEventListener('play', () => {
        console.log('Audio play triggered for:', url);
      });
    } catch (error) {
      console.error('Failed to create audio:', error);
      audioObj = null;
    }
    return audioObj;
  }, [url]);
};

export default useAudioHook;
