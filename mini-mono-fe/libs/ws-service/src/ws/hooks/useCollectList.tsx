import { useEffect, useState } from 'react';
import { getPreference } from '../../api';

const useCollectList = () => {
  const [spotCollect, setSpotCollect] = useState([]);
  const [futureCollect, setFutureCollect] = useState([]);

  const getCollectList = async () => {
    const res = await getPreference();
    const futureFavList =
      res?.preferences?.bookSymbolSequence?.split(',') || [];
    const spotFavList =
      res?.preferences?.spotBookSymbolSequence?.split(',') || [];
    setSpotCollect(spotFavList);
    setFutureCollect(futureFavList);
  };

  return {
    getCollectList,
    spotCollect,
    futureCollect
  };
};

export { useCollectList };
