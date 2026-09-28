
import { useEffect, useState } from 'react';
import {getPrewidAddress} from '~/api';
import { Skeleton } from 'antd';
import { isPC } from '@better-bit-fe/base-utils';

const Wrapper = () => {

  const [iframeSrc, setIframeSrc] = useState('');
  const [active, setActive] = useState(true);
  const isPc = isPC()
  useEffect(() => {
    const params = {
      type: isPc ? 'pc': 'mobile',
      uRkey: process.browser ? window.location.hostname : 'www.easicoin.io',
    }
    getPrewidAddress(params).then(res => {
      setIframeSrc(res.url);
      setActive(false);
    })
  }, []);
  return (
    <div>
      {iframeSrc && <iframe className='min-h-[850px] md:min-h-[1000px] w-full' src={iframeSrc}></iframe>}
      {!iframeSrc &&
        <div className="px-10 py-10 flex flex-col gap-8">
          <Skeleton avatar paragraph={{ rows: 2 }} active={active}  />
          <Skeleton avatar paragraph={{ rows: 4 }} active={active} />
          <Skeleton avatar paragraph={{ rows: 7 }} active={active} />
        </div>
      }
    </div>
    // <div className='px-4 bg-[#0B0611] flex flex-col items-center justify-center' >
    //   <BuyCrypto />
    //   <Trending />
    //   <CommonTips />
    //   <div className='w-full flex flex-col items-center justify-center gap-4 rounded-[20px] pt-20 bg-[radial-gradient(120.59%_280.93%_at_93.96%_-5.23%,#916BE6_0%,#692FE4_45.77%,#4F24AD_100%)]'>
    //     <h1 className='text-[44px] font-bold leading-[56px] text-white'> Ready to buy crypto in seconds ?</h1>
    //     <p className='text-[20px] leading-7 text-white'>Create a free account to start investing</p>
    //     <div className='bg-white flex items-center justify-center p-[6px] rounded-[3.6px]'>
    //       <Image src={`${basePath}/images/downloadQrcode.png`} width={96} height={96} alt='downloadQrcode' />
    //     </div>
    //
    //     <Image src={`${basePath}/images/contactActivity.png`} width={1332} height={450} alt='contactActivity' />
    //   </div>
    // </div>
  )
}

export default Wrapper;
