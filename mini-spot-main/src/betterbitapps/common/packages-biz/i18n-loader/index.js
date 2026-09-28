import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import createRequest from '@unified/request';
import { map } from '@unified/helpers';
import Backend from 'by-i18n-backend';
import { Env } from '@region-lib/env';
import { LANG_KEY, LANGUAGES } from '@region-lib/language';
import { getLang } from 'common/utils/storageData';

const i18nRequestOptions = {
  withCredentials: false,
};
const i18nHttpInstance = createRequest(i18nRequestOptions);

i18nHttpInstance.interceptors.response.use((wrappedResp) =>
  Promise.resolve(wrappedResp.data),
);

const DEFAULT_LANG = getLang();
const { TMS_HOST, TMS_PATH } = Env;

const initI18nInstance = ({
  projectId,
  ns,
  defaultNS,
  loadPath,
  defaultLang, // undefined
}) => {
  i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      // debug: !isProduction,
      detection: {
        cacheKey: LANG_KEY,
        supportLangs: map(LANGUAGES, ({ value }) => value),
      },

      backend: {
        loadPath: loadPath || `${TMS_HOST}${TMS_PATH}`,
        projectId,
        fetch: i18nHttpInstance,
      },

      fallbackLng: defaultLang || DEFAULT_LANG,
      load: 'currentOnly',
      ns,
      defaultNS,

      // we do not use keys in form messages.welcome
      keySeparator: '.',
      interpolation: {
        escapeValue: false, // react already safes from xss
      },
    });

  return i18n;
};

export default initI18nInstance;
