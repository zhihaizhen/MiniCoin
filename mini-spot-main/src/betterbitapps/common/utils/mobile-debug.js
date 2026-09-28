import Url from 'url-parse';

const url = new Url(window.location.href);
const { query } = url;
const canDebug = /[?&]marvel_app_mobile_debug=true/.test(query);
const debug =
  !!process.env.MARVEL_APP_MOBILE_DEBUG ||
  (canDebug && process.env.NODE_ENV === 'development');
if (debug) {
  import('eruda').then((lib) => {
    const { default: eruda } = lib;
    try {
      eruda.init();
    } catch (e) {
      lib.init();
    }
  });
}
