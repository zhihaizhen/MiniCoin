// @ts-nocheck
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { Spin } from 'antd';
import { useRouter } from 'next/router';
import { LoadingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { basePath, ENV, isMobile } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { postTgLogin, postProfileUpdate, getBotId } from '~/api';
import { useParticle } from '~/hooks/useParticle';
import WalletLoading from '~/components/walletLoading';
import MiniLogin from '~/components/miniLogin';
import Style from './index.module.less';

interface ILoginContentProps {
  handleShowBindEmail: (autoRedirect?: boolean) => void;
  mode: 'login' | 'register';
}

const LoginContent: React.FC<ILoginContentProps> = (props) => {
  const { handleShowBindEmail, mode } = props;
  const [walletDetail, setwalletDetail] = useState({
    visible: false,
    address: ''
  });
  const router = useRouter();
  const emailRef = useRef();
  const isMb = useMemo(() => isMobile(), []);
  const { isLogin, updateUserInfo, userInfo } = useUserInfo();
  const { connect, getAddress } = useParticle();
  const t = useFm();
  const [loading, setloading] = useState<boolean>(true);

  const changeWalletDetail = (value: { visible: boolean; address: string }) => {
    setwalletDetail(value);
  };

  const getWalletDetail = async () => {
    const address = await getAddress();
    if (address) {
      setwalletDetail({ ...walletDetail, address });
    }
  };
  useEffect(() => {
    document.title = '';

    if (isLogin && userInfo) handleShowBindEmail();
  }, [isLogin, userInfo]);

  useEffect(() => {
    if (userInfo && walletDetail.address) {
      if (userInfo?.address !== walletDetail.address) {
        postProfileUpdate({ address: walletDetail.address });
      }
    }
  }, [walletDetail, userInfo, userInfo?.address]);

  useEffect(() => {
    if (userInfo) {
      getWalletDetail();
    }
  }, [userInfo]);

  useEffect(() => {
    setloading(false);
  }, []);

  return (
    <>
      {walletDetail?.visible ? (
        <WalletLoading
          walletAddress={walletDetail.address}
          handleShowBindEmail={handleShowBindEmail}
        />
      ) : (
        <div className={Style.loginContent}>
          {loading ? (
            <div className={Style.loadingContainer}>
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{
                      fontSize: 48
                    }}
                  />
                }
                style={{ color: 'var(--text-brand-default)' }}
              />
            </div>
          ) : (
            <MiniLogin
              walletDetail={walletDetail}
              changeWalletDetail={changeWalletDetail}
              mode={mode}
            />
          )}
        </div>
      )}
    </>
  );
};

export default LoginContent;
