export const ADJUST_APP_TOKEN = 'vta9b2a8hdds'; // adjust app ID
export const ADJUST_WEB_TOKEN = '3nbh4p45w5a8'; // for samrt banner
export const ADJUST_SMART_BANNER_TRACKER = 'e1ysu4u';
export const DOM_ID = 'adjust-script'; // dom id of script avoiding duplicate load
export const ADJUST = 'Adjust'; // global variable in window
export const ADJUST_CDN_URL =
  '';
export const CHANNEL_ATTR_PARAMS = [
  // params from cookie "REG_REF_${ENV}"
  'lang',
  'affiliate_id',
  'group_id',
  'group_type',
  'ref',
  'utm_url',
  'utm_date',
  'medium',
  'source',
  'campaign',
  'content',
  'referrer',
  'srcexid',
  'scrplatform',
  'url'
];
export const DEFAULT_DEEPLINK_URL = 'app://open/home?tab=1';
export enum ENVIRONMENT {
  SANDBOX = 'sandbox',
  PRODUCTION = 'production'
}
export enum LOG_LEVEL {
  ERROR = 'error',
  VERBOSE = 'verbose'
}
export const LINK_BUTTON_STYLES = {
  display: 'inline-block',
  verticalAlign: 'middle',
  color: '#fff',
  background: 'rgba(255, 177, 26, 1)',
  border: 'none',
  borderRadius: '10px',
  padding: '9px 10px',
  marginRight: '10px',
  fontWeight: 'bold',
  textAlign: 'center',
  boxShadow: 'none',
  letterSpacing: '1.15px'
};
export const DELAY_TO_LOAD_TIME = 10000;
