import { Env } from '@region-lib/env';
import { fetch } from './request';

const { API_HOST } = Env;

export const URL = {
  currentCountryCode: `${API_HOST}/user/public/v3/country-code`,
  getSocialMediaList: `${API_HOST}/commom-public/index/public/v2/mult-social-media/list` // 获取社媒信息
};

export const getCurrentCountryCode = (params?) => {
  return fetch({
    url: URL.currentCountryCode,
    method: 'GET',
    params
  });
};


export const getSocialMediaList = () => {
  return fetch({
    url: URL.getSocialMediaList,
    method: 'GET'
  });
};


