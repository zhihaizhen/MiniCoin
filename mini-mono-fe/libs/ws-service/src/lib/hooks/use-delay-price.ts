import useInstrumentStore from '../common/public-ws/stream-hooks/use-instrument-store';
import { useEffect, useState } from 'react';

export default function useDelayPrice() {
  const { formattedLastPrice } = useInstrumentStore();
  const [delayPrice, setDelayPrice] = useState(formattedLastPrice);
  useEffect(() => {
    setTimeout(() => {
      setDelayPrice(formattedLastPrice);
    }, 500);
  }, [formattedLastPrice]);
  return {
    delayPrice
  };
}
