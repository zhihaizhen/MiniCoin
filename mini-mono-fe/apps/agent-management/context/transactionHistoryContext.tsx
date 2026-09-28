// @ts-nocheck
/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, useContext, useEffect, useState } from 'react';
import { isApp } from '@better-bit-fe/base-utils';
import { cookie } from '@region-lib/helper';
import { getAppScreenHeight, getAppToken } from '~/utils/jsbHelper';
import { Env, urlInfo } from '@region-lib/env';
import useUserProfile from '~/hooks/useUserProfile';
import useDashboard from '~/hooks/useDashboard';
import useReferralInfo from '~/hooks/useReferralInfo';
import { setAuthToken } from '~/utils/auth-token';
import { IUserProfile, IReferralLink } from '~/types';

interface IContextReferral {
  initialized: boolean;
  hasAuth: boolean;
  userProfile: IUserProfile;
  hasReferrer: boolean;
  defaultReferralLink: IReferralLink;
  fetchDefaultReferralLink: () => void;
}

const ContextTransaction = createContext<IContextReferral>({
  initialized: false,
  hasAuth: false,
  userProfile: null,
  defaultReferralLink: null,
  fetchDefaultReferralLink: () => {},
  overviewCardData: null,
  getOverviewCardData: () => {},
  commissionCardData: null,
  getCommissionCardData: () => {}
});

const TransactionHistoryProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);
  const { userProfile, fetchUserProfile } = useUserProfile();
  const {
    overviewCardData,
    getOverviewCardData,
    commissionCardData,
    getCommissionCardData
  } = useDashboard();
  const { defaultReferralLink, fetchDefaultReferralLink } = useReferralInfo();

  const setAuth = async () => {
    const authToken = new URLSearchParams(window?.location?.search).get('auth');

    if (authToken) {
      setAuthToken(authToken);
      console.log('__GET_TOKEN', authToken);
      await fetchUserProfile();
    }
    console.log('__INITIALIZED');
    setInitialized(true);
  };

  useEffect(() => {
    if (userProfile?.id) {
      console.log('__AUTH_VALIDATED');
      console.log('__USER_INFO', userProfile);
      setHasAuth(true);
    } else {
      console.log('__AUTH_FAILED');
    }
  }, [userProfile]);

  useEffect(() => {
    setAuth();
    getAppToken(getAppTokenCb);
  }, []);

  // app的回调函数，获取cookie,setcookie，发出接口请求
  const getAppTokenCb = (data) => {
    try {
      const resList = data.params.cookies.split(';');
      const token = resList[0].split('=')[1];
      const key = `auth_token_${urlInfo.envName}`;
      // alert(`token种植   ${token},Env.COOKIE_DOMAIN: ${Env.COOKIE_DOMAIN}`);
      cookie.set(key, token, {
        path: '/',
        domain: Env.COOKIE_DOMAIN,
        expires: 10080
      });
      // alert(`token种植 成功`);
      setHasAuth(true);
    } catch (err) {
      // alert(`getAppTokenCb错误${JSON.stringify(err)}`);
      console.error(err);
    }
  };

  return (
    <ContextTransaction.Provider
      value={{
        initialized,
        hasAuth,
        userProfile,
        defaultReferralLink,
        fetchDefaultReferralLink,
        overviewCardData,
        getOverviewCardData,
        commissionCardData,
        getCommissionCardData
      }}
    >
      {children}
    </ContextTransaction.Provider>
  );
};

const useContextReferral = () => useContext(ContextTransaction);

export { TransactionHistoryProvider, useContextReferral };
