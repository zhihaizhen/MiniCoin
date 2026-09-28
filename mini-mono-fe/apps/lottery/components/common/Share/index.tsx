import React, { useState } from 'react';
import ReferralShareModal from '~/components/common/ShareModal';
import { basePath } from '@better-bit-fe/base-utils';
import { ReactComponent as ShareIcon } from '~/public/images/share.svg';
import { useFm } from '@better-bit-fe/base-hooks';
import ExportedImage from 'next-image-export-optimizer';

interface ShareProps {
  title?: string;
  activeTime?: string;
  isBlock?: boolean;
}

const Share = ({ title, isBlock, activeTime }: ShareProps) => {
  const t = useFm()
  const [isOpen, setIsOpen] = useState(false);

  const onCloseModal = () => {
    setIsOpen(false);
  };
  return (
    <>
      <div
        className="fixed flex flex-col justify-center items-center gap-1.5 md:gap-4 right-4 bottom-[130px] min-w-14 md:min-w-[126px] rounded-lg md:rounded-[20px] border-[0.5px] p-2 md:p-4
          border-line-border-hover bg-(--fill-tag-brand-transparent) backdrop-blur-[1.5px] cursor-pointer z-99"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ExportedImage
          className="hidden md:block"
          src={`${basePath}/images/gift.png`}
          alt="gift"
          width={72}
          height={72}
        />
        <ExportedImage
          className="md:hidden"
          src={`${basePath}/images/gift.png`}
          alt="gift"
          width={28}
          height={28}
        />

        <div className="h-4 md:h-7 text-text-brand-default md:text-black text-[10px] md:text-sm font-normal flex justify-center items-center gap-2 md:bg-text-brand-default  md:px-2 rounded-2xl">
          <ShareIcon className="hidden md:block" />
          <span> {t('inviteFriends')}</span>
        </div>
      </div>
      <ReferralShareModal
        isBlock={isBlock}
        title={title}
        subTitle={activeTime}
        modalOpen={isOpen}
        onClose={onCloseModal}
      />
    </>
  );
};

export default Share;
