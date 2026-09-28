import { useFm } from '@better-bit-fe/base-hooks';
import { goPage } from '@better-bit-fe/base-utils';

const FooterBanner = ({ isBlock = false }) => {
  const t = useFm()
  const onRegister = () => {
    goPage('login')
  }

  return (
    <div className="w-full h-[208px] md:h-[294px] flex flex-col justify-center items-center gap-6 bg-[linear-gradient(180deg,#070808_6.5%,#587C00_141.83%)]">
      <h1 className="text-white text-2xl md:text-[40px] font-semibold">  {isBlock ? t('footer-title-block') : t('header-title')}</h1>
      <div className="bg-white text-primary min-w-[160px] rounded-[100px] hover:opacity-90 cursor-pointer py-3 text-center text-sm font-semibold select-none"
        onClick={onRegister}>
        {t('lottery-register')}
      </div>
    </div>
  )
}

export default FooterBanner
