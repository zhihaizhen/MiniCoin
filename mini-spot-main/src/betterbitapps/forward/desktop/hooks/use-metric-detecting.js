import { useEffect } from 'react';


const useMetricDetecting = () => {
  useEffect(() => {
    if (window && window.performance) {
      // tracing.addRTEvent({
      //   name: 'web',
      //   observe: window.performance.now(),
      //   parms: ['path', 'Mounted'],
      // });
    }
  }, []);
};

export default useMetricDetecting;
