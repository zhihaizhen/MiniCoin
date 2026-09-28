import initI18nInstance from 'common/packages-biz/i18n-loader';
import { Env } from '@region-lib/env';

const { TMS_HOST, TMS_PATH } = Env;

const i18nInstance = initI18nInstance({
  projectId: 'region-translations',
  ns: ['spot', 'ztsl_error_code', 'trade-share'],
  defaultNS: 'spot',
  loadPath: TMS_PATH,
});

export default i18nInstance;
