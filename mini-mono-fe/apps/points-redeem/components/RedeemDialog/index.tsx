import { Modal } from 'antd';
import React from 'react';
import { ReactComponent as CloseIcon } from '~/public/images/close.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';
import { basePath } from '~/env';
import { getLang, goPage } from '@better-bit-fe/base-utils';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { useAwardInfo } from '~/hooks/useAwardInfo';
import { AwardItem } from '~/interface';
import { AwardType } from '~/enums';
import { FormattedMessage } from 'react-intl';

interface RedeemDialogProps {
  award?: AwardItem;
  open: boolean;
  close: () => void;
}

 const CASH_AWARD_TYPES = new Set([
  AwardType.ServiceCash,
  AwardType.PostGivenCash,
  AwardType.PreGivenCash
]);

const RedeemDialog: React.FC<RedeemDialogProps> = ({
  award,
  open,
  close
}: RedeemDialogProps) => {
  const t = useFm();
  const { isLogin } = useUserInfo();

  const { awardDesc, tokenStr, imageUrl } = useAwardInfo(award);

  // 联系客服回调
  const handleContactService = () => {

    // 如果已登录，等待 Chat 组件挂载后直接打开客服面板
    if (!isLogin) return;
    console.log('用户已登录，准备打开客服面板');
    // 延迟执行，确保 Chat 组件和 udesk 已经初始化完成
    setTimeout(() => {
      // 直接调用 udesk 的 showPanel 方法
      // @ts-ignore
      if (window.ud) {
        // @ts-ignore
        window.ud('showPanel');
      } else {
        // 如果 udesk 还未初始化，尝试点击客服按钮
        const chatButton = document.querySelector('#brandChat');
        if (chatButton) {
          (chatButton as HTMLElement).click();
        }
      }
    }, 500);
  };

  const handleViewReward = () => {
    if (+award?.auto_distribute) {
      close();
      handleContactService();
      return;
    }

    if (CASH_AWARD_TYPES.has(award?.award_type)) {
      window.location.href = `/${getLang()}/rewards-hub/coupon-center`;
      close();
      return;
    }
    goPage('tradeHistory');
    close();
  };
  return (
    <Modal
      open={open}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={478}
      footer={null}
    >
      <div className="w-full">
        <div className="w-full flex items-center justify-end">
          <div className="cursor-pointer" onClick={close}>
            <CloseIcon />
          </div>
        </div>
        <div className="text-text-primary font-semibold text-xl text-center">
          🎉 {t('gladToRedeem')}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <ExportedImage
            src={`${basePath}/images/gift/${imageUrl}`}
            alt="gift"
            width={92}
            height={92}
          />
          <div className="text-base md:text-lg font-bold text-text-primary line-clamp-3 text-center">
            <FormattedMessage
              id="tokenformatredeem"
              defaultMessage={tokenStr}
              values={{
                i: (chunks: React.ReactNode) => <span className="text-text-brand-default-web">{chunks}</span>,
              }}
            />
          </div>
          <div className="text-xs font-semibold text-text-secondary text-center">
            {awardDesc}
          </div>
        </div>

        <div
          className="mt-8 w-full h-12 bg-fill-button-brand-default hover:bg-fill-button-brand-hover cursor-pointer rounded-full
          text-sm font-semibold text-black flex justify-center items-center"
          onClick={handleViewReward}
        >
          {+award?.auto_distribute ? t('goContact') : t('lookNow')}
        </div>
      </div>
    </Modal>
  );
};

export default RedeemDialog;
