import React, { useState, useRef } from 'react';

const totalCountDown = 60;
export default function useCountDown() {
  const [countdown, setcountdown] = useState('00:00');
  const [isResendDisabled, setisResendDisabled] = useState(false);
  // const countdown = ref('00:00');
  // const isResendDisabled = ref(false);
  let timer = useRef(null);
  let coundownTimer = totalCountDown;
  function resendTimeInterver() {
    setcountdown('00:' + totalCountDown);
    setisResendDisabled(true);
    timer.current = setInterval(() => {
      coundownTimer--;
      setcountdown((coundownTimer < 10 ? '00:0' : '00:') + coundownTimer);
      if (coundownTimer <= 0) {
        clearInterval(timer.current);
        setisResendDisabled(false);
        coundownTimer = totalCountDown;
      }
    }, 1000);
  }
  function clearTimeInterver() {
    clearInterval(timer.current);
    setisResendDisabled(false);
    coundownTimer = totalCountDown;
  }
  return {
    setcountdown,
    setisResendDisabled,
    countdown,
    isResendDisabled,
    resendTimeInterver,
    clearTimeInterver
  };
}
