import { IUserInfo } from '../libs/base-ui/src/types';
interface RegionFrame {
  ready: (uniframe: RegionFrame) => void;
  header: {
    symbol: string | number; // 当前交易symbol，用于高亮显示
    tradeType: string | number; // 当前交易类型：inverse或forward
    userInfo: IUserInfo; //用户信息
    init: (container?: HTMLElement) => void;
    setProperty: (key: string, value: any) => void;
    subscribeEvent: (
      event: string,
      callback: (value: string | number) => void
    ) => void;
    languageChange: (
      event: string,
      callback: (value: string | number) => void
    ) => void;
    logout: () => void;
  };
  footer: {
    init: () => void;
    setProperty: (key: string, value: any) => void;
    subscribeEvent: (
      event: string,
      callback: (value: string | number) => void
    ) => void;
    languageChange: (
      event: string,
      callback: (value: string | number) => void
    ) => void;
  };
  isReady: boolean;
  readyQueue: any;
  deposit: any;
  transfer: any;
  adaBot: any;
}

interface Hecate {
  ready: any;
  moduleExists: (moduleName: string) => boolean;
  canInvoke: (params: {
    moduleName: string;
    methodName: string;
  }) => Promise<boolean>;
  module: (moduleName: string) => {
    method: (methodName: string) => {
      invoke: {
        (param: any): Promise<{
          code: number;
          params: any;
        }>;
      };
    };
  };
}
declare global {
  interface Window {
    GA_UID: any;
    RegionFrame: RegionFrame;
    zE: any;
    Hecate: Hecate;
    branch: any;
    adaSettings: any;
    adaEmbed: any;
    Adjust: any;
    initGeetest: any;
  }
}
interface Window {
  GA_UID: any;
  RegionFrame: RegionFrame;
  zE: any;
  Hecate: Hecate;
  branch: any;
  adaSettings: any;
  adaEmbed: any;
  Adjust: any;
  initGeetest: any;
}
