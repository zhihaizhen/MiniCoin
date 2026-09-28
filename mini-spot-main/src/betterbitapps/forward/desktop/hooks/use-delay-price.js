import useCurSymbolQuoteStream from 'common/public-ws/stream-hooks/use-instrument-stream';
import { useEffect, useState } from 'react';

export default function useDelayPrice() {
  const { formattedClosePrice } = useCurSymbolQuoteStream();
  const [delayPrice, setDelayPrice] = useState(formattedClosePrice);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayPrice(formattedClosePrice);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [formattedClosePrice]);
  return {
    delayPrice,
  };
}
