import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { basePath } from '@better-bit-fe/base-utils';
import Image from 'next/image';
import { getLoginQrCode, postLoginQrCodeCheck } from '~/api';
import {ReactComponent as YesIcon } from '~/public/images/yes.svg';
import {ReactComponent as LogoIcon } from '~/public/images/logo.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { FormattedMessage } from 'react-intl';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

enum StatusType {
  EXPIRED = "expired",
  PENDING = "pending",
  WAIT = "wait",
  APPROVED = "approved",
}
type QrCodeStatusResponse = {
  status: StatusType;
};
interface IProps {
  active: boolean;
  checkIpRestriction?: () => Promise<boolean>;
}
const QrcodeLogin = ({active, checkIpRestriction}:IProps) => {

  const t = useFm()
  const [qrcode, setQrcode] = useState('');
  const [status, setStatus] = useState<StatusType>(StatusType.PENDING);
  const [loading, setLoading] = useState(true);

  const { updateUserInfo } = useUserInfo();

  const updateQrcode = () => {
    setLoading(true);
    getLoginQrCode().then((res: { qrcode: string }) => {
      setQrcode(res.qrcode);
      // 新二维码回到可扫码状态
      setStatus(StatusType.PENDING);
    }).catch(() => {
      // 异常时置为过期状态，允许用户手动刷新
      setStatus(StatusType.EXPIRED);
    }).finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    if (!active) return;
    updateQrcode()
  },[active])

  useEffect(() => {
    // 没有二维码 / 已过期 / 已成功 / 未激活，都不需要轮询
    if (!qrcode || status === StatusType.EXPIRED || status === StatusType.APPROVED || !active) return;

    const timer = setInterval(() => {
      postLoginQrCodeCheck({qrcode}).then(async (res: QrCodeStatusResponse) => {
        if (res.status === StatusType.APPROVED) {
          clearInterval(timer);
          if (checkIpRestriction) {
            const restricted = await checkIpRestriction();
            if (restricted) {
              setStatus(StatusType.EXPIRED);
              return;
            }
          }
          setStatus(res.status);
          updateUserInfo();
        } else {
          setStatus(res.status);
        }
      });
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [qrcode, status, updateUserInfo, active, checkIpRestriction]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return (
    <div className="pt-8">
      <div className="flex items-center justify-center gap-6">

        <div className="relative w-[176px] h-[176px] flex justify-center items-center rounded-[10px] bg-white shadow-[1.5px_0_4px_2px_rgba(0,0,0,0.03)]">
          {loading ? <Spin indicator={antIcon} /> :
            <>
              <QRCode
                size={145}
                value={qrcode || ''}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
              />
              <div className={`absolute w-full h-full flex justify-center items-center  ${ status === StatusType.EXPIRED || status === StatusType.WAIT ? 'bg-fill-mask rounded-[10px]': ''}`}>
                {
                  status === StatusType.PENDING ? <LogoIcon /> : ''
                }
                {
                  status === StatusType.EXPIRED && (
                    <div className='flex flex-col justify-center items-center gap-4'>
                      <span className="text-sm text-white font-medium"> {t('expired-qrcode')}</span>
                      <div className="bg-fill-button-tertiary-default w-[94px] rounded-full text-text-primary text-xs font-semibold p-3 flex justify-center items-center cursor-pointer" onClick={updateQrcode}> {t('refresh')} </div>
                    </div>
                  )
                }
                {
                  status === StatusType.WAIT && (
                    <div className='flex flex-col justify-center items-center gap-4'>
                      <YesIcon />
                      <span className="text-sm text-white font-medium"> {t('confirm-phone')} </span>
                    </div>
                  )
                }
              </div>
            </>
          }
        </div>
        <div>
          <Image src={`${basePath}/images/qrCodeEntrance.png`} width={167} height={167} alt="QrCodeEntrance" unoptimized />
        </div>
      </div>

      <div className="text-sm mt-8">
        <FormattedMessage
          id="qrcode-tips"
          values={{
            b: (chunks) => <span className="text-text-brand-default">{chunks}</span>
          }}
        />
      </div>
    </div>
  )
}

export default QrcodeLogin
