export const setBodyToUrlParam = (url, body) => {
  try {
    let queryParam = '';
    if (Object.keys(body)?.length > 0) {
      Object.keys(body).forEach((key) => {
        if (body[key]) {
          queryParam += `${key}=${body[key]}&`;
        }
      });
      return `${url}?${queryParam.slice(0, -1)}`;
    }
    return url;
  } catch (e) {
    console.warn(url, body, e);
    return url;
  }
};

/**
 * Set the url params
 * @param param
 * @return void
 *
 *
 * from: ?tab=2&num=343
 * to: setUrlQueryVariable('id', 231) -> ?tab=2&num=343&id=231 ; setUrlQueryVariable('tab', 99) -> ?tab=99&num=343 ;
 */
export const setUrlQueryVariable = (key, value) => {
  try {
    const query = window?.location?.search?.substring(1);
    const vars = query?.split('&');
    let keyExist = false;
    for (let i = 0; i < vars?.length; i += 1) {
      const pair = vars[i]?.split('=');
      if (pair[0] === key) {
        keyExist = true;
        vars[i] = `${key}=${value}`;
        break;
      }
    }

    if (!keyExist) {
      vars?.push(`${key}=${value}`);
    }

    if (window?.history?.pushState) {
      const newUrl = `${window?.location?.origin}${
        window?.location?.pathname
      }?${vars
        ?.filter((i) => !!i)
        ?.join('&')
        .replace(/^&+/, '')}`;
      window?.history?.pushState({ path: newUrl }, '', newUrl);
    }
  } catch (e) {
    console.error('Push Param Query:', e);
  }
  return;
};

export const keepUrlQueryParams = (newPath: string): string => {
  const paramsStr = window?.location?.search;
  const hashStr = window?.location?.hash;
  return `${newPath}${paramsStr}${hashStr}`;
};

export const getQueryParams = (key: string) => {
  const queryString = window?.location?.search;
  const urlParams = new URLSearchParams(queryString);

  return urlParams.get(key);
};



export const goDetailPage = (locale, path) => {
  location.href = `/${locale}/campaign/reward-landing/${path}`;
};


