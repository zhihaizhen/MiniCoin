// @ts-nocheck
import { useEffect } from 'react';
import Image from 'next/image';
import { Button, message } from 'antd';
import copy from 'copy-to-clipboard';
import {
  LoadingOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath, ENV, isMobile } from '@better-bit-fe/base-utils';
import { postProfileUpdate } from '~/api';
import { formatCryptoAddress } from '~/utils';
import Style from './index.module.less';

export interface IWalletLoadingProps {
  walletAddress: string;
  handleShowBindEmail: (autoRedirect?: boolean) => void;
}

export default function WalletLoading(props: IWalletLoadingProps) {
  const { walletAddress, handleShowBindEmail } = props;
  const t = useFm();
  const { userInfo, isLogin } = useUserInfo();

  const handleConfirmLogin = () => {
    if (walletAddress && isLogin && userInfo) handleShowBindEmail();
  };

  // useEffect(() => {
  //   console.log(userInfo?.address, walletAddress, 999);
  //   if (userInfo && walletAddress) {
  //     if (userInfo?.address !== walletAddress) {
  //       postProfileUpdate({ address: walletAddress });
  //     }
  //   }
  // }, [walletAddress, userInfo]);
  return (
    <div className={Style.walletLoading}>
      <div className={Style.container}>
        <Image
          src={basePath + '/images/loading-logo.svg'}
          alt={'loading-logo'}
          width={320}
          height={113}
        />
        {/* <p className={Style.desc}>{t('walletLoadingTitle')}</p> */}
        <p
          className={Style.desc}
          dangerouslySetInnerHTML={{ __html: t('walletLoadingTitle') }}
        ></p>
        <div className={Style.loadingArea}>
          {walletAddress ? (
            <div className={Style.hasAddress}>
              <div>
                <CheckCircleOutlined
                  style={{ color: 'white', marginRight: '8px' }}
                />
                <span>{t('walletGenerated')}</span>
              </div>
              <div className={Style.copyAddress}>
                <p>{formatCryptoAddress(walletAddress)}</p>
                <CopyOutlined
                  width={16}
                  height={16}
                  style={{ color: 'white', cursor: 'pointer' }}
                  onClick={() => {
                    copy(walletAddress);
                    message.success(t('copyTips'));
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={Style.noAddress}>
              <LoadingOutlined style={{ color: 'white', marginRight: '8px' }} />
              <span>{t('walletGererating')}</span>
            </div>
          )}
          <p>{t('particleSign')}</p>
        </div>
        <Button
          type="primary"
          className={Style.confirmBtn}
          disabled={!walletAddress}
          onClick={handleConfirmLogin}
        >
          {t('goExploreBtn')}
          <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
}
