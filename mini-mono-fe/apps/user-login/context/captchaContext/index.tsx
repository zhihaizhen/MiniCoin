import React, { createContext, useContext } from 'react';
import { useCaptcha } from '~/hooks/useCaptcha';

const captchaContext = createContext<any>({});

const CaptchaProvider: React.FC<any> = ({ children }) => {
  const { captcha, showCaptcha } = useCaptcha();
  return (
    <captchaContext.Provider value={{ captcha, showCaptcha }}>
      {children}
    </captchaContext.Provider>
  );
};

const useCurCaptcha = () => {
  const { captcha, showCaptcha } = useContext(captchaContext);
  return { captcha, showCaptcha };
};

export { CaptchaProvider, captchaContext, useCurCaptcha };
