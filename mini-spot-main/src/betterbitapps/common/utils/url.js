import { getLang } from 'common/utils/storageData';
import { TransferModal } from 'betterbit-ui';
import { message } from 'common/antdComponents';

const lang = getLang();

const returnPageParam = window.btoa(
     `${window.location.origin}/${lang}/spot/exchange/BTC/USDT`
   );
export const loginUrl = () => `/${lang}/account/login?return_page=${returnPageParam}`;
export const registerUrl = () => `/${lang}/account/register?return_page=${returnPageParam}`;

export const handleLoginUrl = () => {
  window.location.href = loginUrl();
}

export const handleRegisterUrl = () => {
  window.location.href = registerUrl();
};

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

export const handleCouponUrl = () => {
  window.location.href = `/${lang}/campaign/voucher-landing/korean-de`;
};

export const handleDepositUrl = () => {
  window.location.href = `/${lang}/assets/deposit`;
}

export const handleDownloadUrl = () => {
  window.location.href = `/${lang}/downloadApp/`;
}


export const handleTransferUrl = (t_asset,t_error,loggedIn) => {
  if (!loggedIn) {
     handleLoginUrl()
  }
  // const fn = ({ result, err }) => {
  //   if (result === 'success') {
  //     message.success(t_asset('transfer-success'));
  //   } else {
  //     message.error(t_error(err?.response?.data?.code));
  //   }
  // };

  TransferModal.show({
    from: 'FUNDING',
    to: 'SPOT',
    // callback: fn,
  });
};