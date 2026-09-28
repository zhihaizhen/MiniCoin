import { useEffect } from 'react';
import { storage } from 'by-storage';

export const useFixStudyCompare_markPrice = (localKey, ticker) => {
  useEffect(() => {
    const lastStore = storage.get(localKey);
    let modifyFlag = false;
    if (lastStore) {
      const lastStoreObj = JSON.parse(lastStore);
      const { charts = [] } = lastStoreObj;
      charts.forEach(({ panes = [] }) => {
        panes.forEach(({ sources }) => {
          sources.forEach(({ type, state }) => {
            if (type === 'study_Compare' && ticker !== state.inputs.symbol) {
              state.inputs.symbol = ticker;
              modifyFlag = true;
            }
          });
        });
      });
      if (modifyFlag) {
        storage.set(localKey, JSON.stringify(lastStoreObj));
      }
    }
  }, [localKey, ticker]);
};
