import React, { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { isProduction } from '@better-bit-fe/base-utils';
import QRCode from 'react-qr-code';


export interface QrcodeProps {
  size?: number;
  width?: string;
  height?: string;
  radius?: string;
}

export const DownloadQrcode: FC<QrcodeProps> = ({ width = '92px', height = '92px', radius = '8px', size = 80 }) => {

  const { locale } = useRouter();
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const url = isProduction
      ? `${window.location.origin}/${locale}/downloadApp`
      : `https://www.test.bitrunfinance.com/${locale}/downloadApp`;
    setQrCodeUrl(url);
  }, [locale]);

  return (
    <div
      className="p-[6px] bg-white flex items-center justify-center"
      style={{
        width,
        height,
        borderRadius: radius
      }}
    >
      <QRCode
        value={qrCodeUrl}
        size={size}
        style={{ height: 'auto', maxWidth: '100%' }}
      />
    </div>

  );
};
