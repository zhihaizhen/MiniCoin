import React, { useEffect, useState } from 'react';

const useCountDown = (s) => {
  const [seconds, setSeconds] = useState(s);
  useEffect(() => {
    setTimeout(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    }, 1000);
  }, [seconds]);

  return [seconds, setSeconds];
};

export default useCountDown;
