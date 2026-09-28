
import WillPay from './WillPay'
import Image from 'next/image';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useRouter } from 'next/router';
import { basePath } from '@better-bit-fe/base-utils';

const BuyCrypto = () => {
  const { locale } = useRouter();
  const { isLogin } = useUserInfo();

  const onSubmit = () => {
    if (!isLogin) {
      window.location.href = `/${locale}/account/login`;
      return
    }
    // TODO
  }
  return (
    <div className='w-full bg-white rounded-[20px] text-[#2F1663] py-20 flex  justify-center items-center'>
      <div className='flex flex-col items-center justify-center gap-[30px]'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-[54px] font-bold leading-16'>简单几步，轻松买币</h1>
          <h5 className='text-xl leading-7'>支持USDT、BTC、ETH等100多种热门数字货币</h5>
        </div>
        <div className='w-[400px] flex flex-col items-center justify-center gap-6 py-4 px-4'>
          <WillPay />
          <WillPay />
          <WillPay />
          <WillPay />
          <div
            className='w-full h-14 flex justify-center items-center bg-button-primary-default rounded-[12px] text-white text-[14px] cursor-pointer'
            onClick={onSubmit}
          >
            {isLogin ? '购买' : '登录'}
          </div>
          <div className='w-full flex justify-between items-center'>
            <div className='text-[18px] w-[177px]'>
              Get the EasiCoin app and trade effortlessly
            </div>
            <Image src={`${basePath}/images/downloadQrcode.png`} width={68} height={68} alt='downloadQrcode' />
          </div>
        </div>

      </div>
    </div>
  )
}

export default BuyCrypto;
