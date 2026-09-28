import React, { ReactNode } from 'react';
import { Modal, Spin } from 'antd';
import Image from 'next/image';
import { ReactComponent as CloseIcon } from './icon/close.svg';
import { ReactComponent as CardBg } from './icon/card.svg';

export interface AwardInfo {
  type?: 'card' | 'default' | '';
  imgSrc?: string;
  amount: string;
  desc?: string;
  unit?: string;
}

export interface ClaimModalProps {
  open: boolean;
  title?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
  confirmLoading?: boolean;
  award?: AwardInfo;
  className?: string;
}

const CardAward = ({ amount, unit, desc }: Pick<AwardInfo, 'amount' | 'unit' | 'desc'>) => (
  <div className="relative w-[136px] h-[88px] md:w-[204px] md:h-[132px] text-[#664F3C] flex flex-col items-center justify-start gap-5 md:gap-8 my-6 md:my-8 pt-4">
    <div className="flex items-end justify-center text-[#593813] text-[28px] md:text-[42px] leading-[24px] md:leading-[44px] font-bold z-1">
      {amount}
      <span className="text-xs md:text-lg font-medium text-[#664F3C]">{unit}</span>
    </div>
    <div className="flex items-center justify-center text-xs md:text-lg font-medium z-1">{desc}</div>
    <CardBg className="absolute inset-0 w-full h-full" />
  </div>
);

const DefaultAward = ({ imgSrc, amount, desc }: Pick<AwardInfo, 'imgSrc' | 'amount' | 'desc'>) => (
  <div className="flex flex-col items-center justify-center py-6 md:py-8">
    <div className="relative w-16 h-16 md:w-20 md:h-20 mb-3 md:mb-4">
      <Image src={imgSrc} alt={desc} fill loader={({ src }) => src} />
    </div>
    <div className="text-text-brand-default text-[20px] md:text-[28px] font-bold mb-2">{amount}</div>
    <div className="text-xs md:text-sm text-text-primary flex justify-start items-center">{desc}</div>
  </div>
);

const ConfirmButton = ({
  loading,
  text,
  onClick,
}: {
  loading?: boolean;
  text: string;
  onClick?: () => void;
}) => (
  <div
    className={`w-full h-10 md:h-12 font-sm md:font-base flex justify-center items-center font-medium
      bg-fill-button-primary-default text-text-white-to-black rounded-full
      ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
    onClick={loading ? undefined : onClick}
  >
    {loading ? <Spin size="small" /> : text}
  </div>
);

export const ClaimModal = ({
  open,
  title,
  confirmText = 'Confirm',
  onConfirm,
  onCancel,
  children,
  confirmLoading,
  award,
  className

}: ClaimModalProps) => (
  <Modal
    open={open}
    onCancel={onCancel}
    styles={{ content: { backgroundColor: 'var(--fill-fill-modal, #101112)', borderRadius: '24px' } }}
    footer={<ConfirmButton loading={confirmLoading} text={confirmText} onClick={onConfirm} />}
    closeIcon={<CloseIcon />}
  >
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      <div className="text-text-primary text-center font-bold text-lg md:text-2xl leading-[26px] md:leading-[32px] mb-[16px] mt-[24px]">
        {title}
      </div>
      {award &&
        (award.type === 'card' ? (
          <CardAward amount={award.amount} unit={award.unit} desc={award.desc} />
        ) : (
          <DefaultAward imgSrc={award.imgSrc} amount={award.amount} desc={award.desc} />
        ))}
      {children}
    </div>
  </Modal>
);
