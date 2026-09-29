import Cookie from 'js-cookie';
import { isDev } from '@better-bit-fe/base-utils';

export const GUID_KEY = '_by_l_g_d';
const hostname = process.browser ? window.location.hostname : '';
export const cookieDomain = isDev
  ? 'localhost'
  : hostname.replace(/^www|m|testnet/, '');

export function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export function Guid() {
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export function getGuid() {
  let guid = Cookie.get(GUID_KEY);
  if (!guid || guid.length !== 36) {
    guid = Guid();
  }
  // Do this to refresh cookie's remaining time.
  Cookie.set(GUID_KEY, guid, {
    expires: 120,
    path: '/',
    domain: cookieDomain
  });

  return guid;
}
