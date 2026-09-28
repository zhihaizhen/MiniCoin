/* eslint-disable */
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Env } from '@region-lib/env';
import { createRequestInstance } from '@better-bit-fe/base-utils';

const { fetch: request } = createRequestInstance({ showErrorMessage: false });

async function fetchUserProfile() {
  const data = await request({
    url: `${Env.API_HOST}/user/private/v3/profile?t=${Date.now()}`,
    method: 'GET'
  });
  return data || false;
}
/**
 * Request handler for fetch user info
 * @param host
 * @param req
 */
// export const getUserInfo = (host, req) => {
//   return req(
//     `${host}/v2/private/user/profile`,
//     {},
//     { method: 'GET', hideToast: true, isRefresh: true }
//   );
// };

/**
 * React Context for UserInfo
 */
export const UserInfoContext = React.createContext({
  userInfo: undefined,
  isLogin: undefined,
  setUserInfo: (cb?: (r: number | undefined) => void) => {
    return;
  },
  isFetched: false,
  updateUserInfo: async () => {
    return await fetchUserProfile();
  }
});
UserInfoContext.displayName = 'UserInfoContext';

/**
 * Custom React Context Provider for providing get/set user info and check user has logined or not
 * @param param0 Object props
 */
export const UserInfoProvider = ({
  children
  // host,
  // req,
  // useJsBridgeInApp = false
}) => {
  const [userInfo, setUserInfo] = useState<any>();
  const [isFetched, setFetched] = useState(false);
  const [isAppSupportJsBridge, setAppSupportJsBridge] = useState(true);
  // const fetchUserInfoWeb = async (cb?: (r: number | undefined) => void) => {
  //   try {
  //     const response = await getUserInfo(host, req);
  //     console.log('web: getUserInfo', response.data);
  //     setUserInfo(response.data);
  //     // set GA_UID for make sure u with data
  //     if (response?.data) {
  //       // window.GA_UID = response?.data?.id || 0;
  //     }
  //     cb?.(response?.data?.id);
  //   } catch (e) {
  //     console.error(`${LOG_PREFIX} fetch result: Fail to get user info`, e);
  //     cb?.(undefined);
  //   }
  //   setFetched(true);
  // };

  // const fetchUserInfoApp = () => {
  //   try {
  //     console.log('JsBridge: fetchUserInfoJsBridge start');
  //     // fetchUserInfoJsBridge({
  //     //   successCallback: (res) => {
  //     //     console.log('JsBridge: fetchUserInfoJsBridge res', res.code);
  //     //     if (res?.code === 0) {
  //     //       const token = res.params?.userToken;
  //     //       if (typeof token !== 'undefined' && token !== null) {
  //     //         const userInfo = res.params || {};
  //     //         const appUserInfo = {
  //     //           ...userInfo,
  //     //           id: userInfo.uid,
  //     //           username: userInfo.userName,
  //     //           vague_email: userInfo.vagueEmail,
  //     //           vague_mobile: userInfo.vagueMobile,
  //     //           mobile_verified: userInfo.mobileVerified,
  //     //           email_verified: userInfo.emailVerified,
  //     //           has_google2fa: userInfo.hasGoogle2fa,
  //     //           lang: userInfo.lang,
  //     //           status: userInfo.status
  //     //         };
  //     //         console.log(`JsBridge: set appUserInfo successful`, userInfo);
  //     //         console.log(`JsBridge: set appUserInfo useid`, userInfo.id);
  //     //         setUserInfo(appUserInfo);
  //     //       }
  //     //     }
  //     //     setFetched(true);
  //     //   },
  //     //   errorCallback: fetchUserInfoWeb
  //     // });
  //   } catch (e) {
  //     console.log('JsBridge: fetch user info JsBridge error', e);
  //   }
  // };

  // const fetchUserInfo = (cb?: (r: number | undefined) => void) => {
  //   if (isApp() && useJsBridgeInApp && isAppSupportJsBridge) {
  //     console.log('JsBridge: userInfo - fetch from app');
  //     fetchUserInfoApp();
  //   } else {
  //     console.log('web: userInfo - fetch from web');
  //     fetchUserInfoWeb(cb);
  //   }
  // };

  // useEffect(() => {
  //   getIsAppSupportJsBridge({
  //     successCallback: (res) => {
  //       const isAppSupportJsBridge = res?.params?.isAppSupportJsBridge;
  //       setAppSupportJsBridge(isAppSupportJsBridge);
  //     }
  //   });
  // }, []);
  async function updateUserInfo() {
    const data = await fetchUserProfile();
    setUserInfo(data);
    return data;
  }

  const isLogin = useMemo(() => {
    if (userInfo && userInfo?.id > 0) {
      // already logined
      return true;
    } else if (userInfo === undefined) {
      // initial process, can not make sure login status
      return undefined;
    } else {
      // unlogin status
      return false;
    }
  }, [userInfo]);

  useEffect(() => {
    fetchUserProfile()
      .then((data) => setUserInfo(data))
      .catch(() => setUserInfo(false));
  }, []);

  return (
    // @ts-ignore
    <UserInfoContext.Provider
      value={{
        userInfo,
        // @ts-ignore
        isLogin,
        setUserInfo,
        isFetched,
        updateUserInfo
      }}
    >
      {children}
    </UserInfoContext.Provider>
  );
};

export default UserInfoContext;

/**
 * Custom React Hooks
 */
export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  return context;
};
