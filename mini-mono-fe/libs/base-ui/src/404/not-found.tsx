import { ReactComponent as NotFoundImage } from './not-found.svg'
import { useFm } from '@better-bit-fe/base-hooks';

export function NotFound(props: any) {
  const t = useFm();
  return (
    <div
      className={
        // 'h-[calc(100vh-180px)] lg:h-[calc(100vh-64px)] flex flex-col items-center justify-center'
        'mt-[64px] lg:mt-[120px] flex flex-col items-center justify-center bg-bg-primary'
      }
    >
      <NotFoundImage className={'w-[476px] mb-[32px]'} />
      <div>
        <div className={'px-8 text-center md:w-full md:flex md:flex-col'}>
          <div className={'text-text-primary text-center font-[600] text-[48px] leading-[64px]'}>{t('404Title')}</div>
          <div className={'text-text-secondary text-center font-[400] text-[16px] leading-[24px] mt-[16px] mb-[32px]'}>{t('404Desc')}</div>
          <span>

            <a href={'/'} className={'h-[48px] p-[12px_36px] bg-fill-button-primary-default text-nowrap cursor-pointer rounded-[12px] font-[600] text-text-white-to-black'}>{t('404Btn')}</a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
