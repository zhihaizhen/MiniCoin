import React, { useEffect, useRef, useMemo } from 'react';

const usePrevious = (data) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = data;
  }, [data]);
  return ref.current;
};
export default usePrevious;
