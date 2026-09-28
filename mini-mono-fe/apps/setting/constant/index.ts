export enum EmailCodeType {
  bind_opt_scenes = 'bind_opt_scenes',
  unbind_opt_scenes = 'unbind_opt_scenes',
  bind_phone = 'bind_mobile',
  unbind_phone = 'unbind_mobile',
  bind_email = 'email_type_bind_email',
  bind_2fa = 'email_type_bind2fa_code',
  unbind_2fa = 'email_type_unbind2fa_code',
  apiKey_2fa_create = 'email_type_api_key_create',
  apiKey_2fa_edit = 'email_type_api_key_edit',
  apiKey_2fa_del = 'email_type_api_key_del',
  apiKey_2fa_detail = 'email_type_api_key_detail',
  passkey_create = 'passkey_create',
  passkey_delete = 'passkey_delete',
  find_password = 'email_type_reset_password'
}

export enum PhoneCodeType {
  reset_pwd_sms = 'reset_password',
  apiKey_2fa_create = 'open_api_key_create',
  apiKey_2fa_del = 'open_api_key_del',
  apiKey_2fa_detail = 'open_api_key_detail',
  passkey_create = 'passkey_create',
  passkey_delete = 'passkey_delete'
}

export const bot_id = {
  local: '6069710838',
  test: '6069710838',
  testnet: '6184839965',
  prod: '6097730408',
  production: '6097730408'
};

export const overseaData = [
  {
    level: 'originalUser',
    tradingVolume: '<1,000,000', //  <1M
    futuresFee: '0.020%/0.080%', // taker/maker
    spotFee: '0.2%'
  },
  {
    level: 'VIP 1',
    tradingVolume: '>1,000,000',
    futuresFee: '0.018%/0.072%',
    spotFee: '0.2%'
  },
  {
    level: 'VIP 2',
    tradingVolume: '>5,000,000',
    futuresFee: '0.015%/0.060%',
    spotFee: '0.2%'
  },
    {
      level: 'VIP 3',
      tradingVolume: '>10,000,000',
      futuresFee: '0.013%/0.052%',
      spotFee: '0.2%'
    },
    {
      level: 'VIP 4',
      tradingVolume: '>20,000,000',
      futuresFee: '0.012%/0.048%',
      spotFee: '0.2%'
    },
    {
      level: 'VIP 5',
      tradingVolume: '>50,000,000',
      futuresFee: '0.011%/0.044%',
      spotFee: '0.2%'
    },
    {
      level: 'VIP 6',
      tradingVolume: '≥100,000,000',
      futuresFee: '0.010%/0.040%',
      spotFee: '0.2%'
    },
    
    {
      level: 'VIP 7',
      tradingVolume: '≥300,000,000',
      futuresFee: '0.008%/0.032%',
      spotFee: '0.2%'
    },
    {
      level: 'VIP 8',
      tradingVolume: '≥500,000,000',
      futuresFee: '0/0.024%',
      spotFee: '0.2%'
    }
  ];

export const hanData = [
    {
      level: 'originalUser',
      tradingVolume: '<100,000,000',
      futuresFee: '0.050%',
      spotFee: '0.10%'
    },
    {
      level: 'VIP 1',
      tradingVolume: '≥100,000,000',
      futuresFee: '0.045%',
      spotFee: '0.10%'
    },
    {
      level: 'VIP 2',
      tradingVolume: '≥200,000,000',
      futuresFee: '0.040%',
      spotFee: '0.09%'
    },
    {
      level: 'VIP 3',
      tradingVolume: '≥400,000,000',
      futuresFee: '0.035%',
      spotFee: '0.08%'
    },
    {
      level: 'VIP 4',
      tradingVolume: '≥600,000,000',
      futuresFee: '0.030%',
      spotFee: '0.06%'
    },
    {
      level: 'VIP 5',
      tradingVolume: '≥1,000,000,000',
      futuresFee: '0.025%',
      spotFee: '0.05%'
    }
    // {
    //   level: 'VIP 6',
    //   tradingVolume: '1000',
    //   futuresFee: '0.1000% / 0.1000%',
    //   spotFee: '0.1000% / 0.1000%'
    // },
    // {
    //   level: 'VIP 7',
    //   tradingVolume: '1000',
    //   futuresFee: '0.1000% / 0.1000%',
    //   spotFee: '0.1000% / 0.1000%'
    // },
    // {
    //   level: 'VIP 8',
    //   tradingVolume: '1000',
    //   futuresFee: '0.1000% / 0.1000%',
    //   spotFee: '0.1000% / 0.1000%'
    // },
    // {
    //   level: 'VIP 9',
    //   tradingVolume: '1000',
    //   futuresFee: '0.1000% / 0.1000%',
    //   spotFee: '0.1000% / 0.1000%'
    // },
    // {
    //   level: 'VIP 10',
    //   tradingVolume: '1000',
    //   futuresFee: '0.1000% / 0.1000%',
    //   spotFee: '0.1000% / 0.1000%'
    // }
  ];

const STORAGE_ADDRESS = 'dex:address';
const STORAGE_KEY = 'dex:key';
const GA_UID = 'GA_UID';
const ISNEWUSER = 'isNewUser';
const AIRDROPTIPS = 'airDropTipsAlready';

export { STORAGE_ADDRESS, STORAGE_KEY, GA_UID, ISNEWUSER, AIRDROPTIPS };
