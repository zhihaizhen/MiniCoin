//  @ts-nocheck
// 每个项目的BASE_PATH，项目启动时，会读取各个项目的basePath，静态读取
export const basePath = `${process.env.BASE_PATH}`;
// export const basePath = '';
// 以下变量都是动态注入，自动生成
// 项目启动时，动态注入
export const ENV = `${process?.env?.PIPELINE_ENV}`; //deploy平台注入
// 效能的PIPELINE_ENV变量，从deploy机器上注入
export const pipelineEnv = `${process.env?.PIPELINE_ENV}`;
export const isProduction = ENV === 'prod' || ENV === 'production';
export const isTestnet = ENV === 'testnet';
export const isTest = !ENV || ENV === 'test';
export const isDev = isTest;
export const isLocal = isTest;

// export const isProduction = ENV === 'production';
// export const isTestnet = ENV === 'testnet';
// export const isTest = ENV === 'test';
// export const isDev = ENV === 'dev';
// export const isLocal = ENV === 'local';

export function getDomain() {
  if (process.browser) {
    return window.location.host.split('.').slice(-2).join('.');
  } else {
    return 'https://www.easicoin.io/';
  }
}

export const getHost = () => {
  if (process.browser) {
    const domain = getDomain();

    if (isProduction) {
      return 'https://www.easicoin.io/';
    }
    if (isTestnet) {
      return '';
    }
    const { protocol } = window.location;
    // 直接从效能的环境变量中获取对应的pipeline-env
    // return `${protocol}//www.${pipelineEnv}.` + domain;
  }
  return '';
};
export const host = getHost();

export const getApiHost = () => {};

export const apiHost = getApiHost();

export function getWsUrl(uid: number) {}
