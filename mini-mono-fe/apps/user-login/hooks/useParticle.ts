import { useState, useEffect, useMemo } from 'react';
import { ParticleNetwork, UserInfo } from '@particle-network/auth';
import { ParticleChains } from '@particle-network/chains';
import { useUserInfo } from '@better-bit-fe/base-provider';

// export interface IuseParticleProps {}

export function useParticle(props?: any) {
  const [picloading, setpicloading] = useState(false);
  const [LogoutLoading, setLogoutLoading] = useState(false);

  // const particle = useMemo(() => {
  //   // TODO: particle config must same as native app
  //   const projectId = '1977b48c-7ff1-4261-9782-e769b6070f9a';
  //   const clientKey = 'c6KOTsYIlCMF3HztyEmjvJ8WYn7PlQZTboLxBGRn';
  //   const appId = 'b438e2e4-6ab3-42f7-82c0-64ebc727a0b8';
  //   const particle = new ParticleNetwork({
  //     projectId: projectId || (process.env.REACT_APP_PROJECT_ID as string),
  //     clientKey: clientKey || (process.env.REACT_APP_CLIENT_KEY as string),
  //     appId: appId || (process.env.REACT_APP_APP_ID as string),
  //     chainName: 'Ethereum',
  //     chainId: 1,
  //     wallet: {
  //       // displayWalletEntry: false
  //       displayWalletEntry: true
  //     }
  //   });
  //   return particle;
  // }, []);
  let particle: ParticleNetwork;
  if (typeof window !== 'undefined') {
    particle = window.ParticleSDK;
  }

  // if (typeof window !== 'undefined' && particle.auth.isLogin) {
  //   window.ParticleSDK = particle;
  // }

  // const routerToApp = (userInfo: UserInfo) => {
  //     console.log('start router to app');
  //     setTimeout(() => {
  //         //TODO: Strongly recommend：Encrypted the info
  //         window.location.href = `happywallet://callback/?userInfo=${encodeURIComponent(JSON.stringify(userInfo))}`;
  //     }, 300);
  // };

  const logout = async () => {
    setLogoutLoading(true);
    window.ParticleSDK.auth
      .logout()
      .then(() => {
        console.log('logout success');
        // setBalance(0);
        // setLoginState(false);
      })
      .catch((err) => {
        console.log('logout error', err);
      })
      .finally(() => {
        setLogoutLoading(false);
      });
  };
  const connect = async (params) => {
    const { jwt } = params;
    if (!jwt) return;
    setpicloading(true);
    try {
      const particleUserInfo = await window.ParticleSDK.auth.login(
        jwt
          ? {
              preferredAuthType: 'jwt',
              account: jwt,
              hideLoading: true
            }
          : undefined
      );
      // const accountAddress = await getAddress();
      // updateProfile, store address
      // if (userInfo?.address !== accountAddress) {
      //   await postProfileUpdate({ address: accountAddress });
      // }
      // routerToApp(userInfo);
      // bind particle SDK into window if successed
      // window.ParticleSDK = particle;
    } catch (error) {
      console.log('connect particle', error);
    } finally {
      setpicloading(false);
    }
  };
  const getAddress = async () => {
    let address = '';
    if (typeof window !== 'undefined' && window?.ParticleSDK?.auth?.isLogin()) {
      address = await window.ParticleSDK.evm.getAddress();
    }
    return address;
  };

  return {
    picloading,
    particle,
    connect,
    logout,
    getAddress
  };
}
