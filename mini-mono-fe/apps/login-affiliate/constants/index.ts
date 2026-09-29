export enum EmailCodeType {
  bind_email = 'email_type_bind_email',
  bind_2fa = 'email_type_bind2fa_code',
  unbind_2fa = 'email_type_unbind2fa_code',
  login_code = 'email_type_login_code',
  login_affiliate = 'login_affiliate'
}

export const bot_id = {
  local: '6069710838',
  test: '6069710838',
  testnet: '6184839965',
  prod: '6097730408',
  production: '6097730408'
};

export enum WalletType {
  none = 0,
  metamask = 1,
  unipass = 2,
  particle = 3
}

const STORAGE_ADDRESS = 'dex:address';
const STORAGE_KEY = 'dex:key';
const GA_UID = 'GA_UID';
const ISNEWUSER = 'isNewUser';
const AIRDROPTIPS = 'airDropTipsAlready';

export { STORAGE_ADDRESS, STORAGE_KEY, GA_UID, ISNEWUSER, AIRDROPTIPS };
