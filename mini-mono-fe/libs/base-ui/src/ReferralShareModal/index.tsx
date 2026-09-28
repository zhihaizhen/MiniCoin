import React, { useMemo } from 'react';
import { Modal } from 'antd';
import domtoimage from 'dom-to-image';
import QRCode from 'react-qr-code';
import { useFm } from '@better-bit-fe/base-hooks';
import { isMobile as isMobileDevice, isApp } from '@better-bit-fe/base-utils';
import SocialShareActions from '../social-share-actions';
import { getRandomId } from './utils';

export interface ReferralShareModalProps {
  modalOpen: boolean;
  referralInfo: {
    inviteCode?: string;
    inviteLink?: string;
  } | null;
  invitationRewardAmount?: string;
  rewardToken?: string;
  basePath?: string;
  /** 直接传入卡片主文案节点，优先级高于 shareTextKey */
  shareTextContent?: React.ReactNode;
  /** 分享主文案 i18n key，默认 share-text（含 amount 插值） */
  shareTextKey?: string;
  /** logo 相对 basePath 的路径，默认 image/logo.png */
  logoPath?: string;
  /** 插图相对 basePath 的路径，默认 image/share-illustration.png */
  illustrationPath?: string;
  onClose?: () => void;
}

const DEFAULT_SHARE_TEXT_KEY = 'share-text';
const INVITE_CODE_LABEL_KEY = 'share-invite-code';
const INVITE_CODE_LABEL_FALLBACK = '输入我的邀请码，加入EasiCoin';
const DEFAULT_LOGO_PATH = 'images/logo.png';
const DEFAULT_ILLUSTRATION_PATH = 'images/share-illustration.png';

const resolveFmText = (
  fm: (id: string, values?: Record<string, string>) => string,
  id: string,
  fallback: string,
  values?: Record<string, string>
) => {
  const text = values ? fm(id, values) : fm(id);
  return text === id ? fallback : text;
};

const CLOSE_ICON = "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='12' fill='%2328292A'/%3E%3Cpath d='M8 8L16.8 16.8' stroke='%23F5F5F5' stroke-width='1.6' stroke-linecap='round'/%3E%3Cpath d='M16.7969 8L7.99687 16.8' stroke='%23F5F5F5' stroke-width='1.6' stroke-linecap='round'/%3E%3C/svg%3E";

const ReferralShareModal: React.FC<ReferralShareModalProps> = ({
  modalOpen,
  referralInfo,
  invitationRewardAmount = '0',
  rewardToken = 'USDT',
  basePath = '',
  shareTextContent,
  shareTextKey = DEFAULT_SHARE_TEXT_KEY,
  logoPath = DEFAULT_LOGO_PATH,
  illustrationPath = DEFAULT_ILLUSTRATION_PATH,
  onClose
}) => {
  const t = useFm();
  const downloadId = useMemo(() => getRandomId(), []);
  const isMobile = isMobileDevice();
  const shareTextFallback = `立即注册<br/>即领 <span style="color:#abe127">${invitationRewardAmount} ${rewardToken}</span>`;
  const shareTextValues =
    shareTextKey === DEFAULT_SHARE_TEXT_KEY
      ? {
          amount: `<span style="color:#abe127">${invitationRewardAmount} ${rewardToken}</span>`
        }
      : undefined;
  const shareTextHtml = resolveFmText(t, shareTextKey, shareTextFallback, shareTextValues);
  const inviteCodeLabel = resolveFmText(t, INVITE_CODE_LABEL_KEY, INVITE_CODE_LABEL_FALLBACK);
  const logoSrc = `${basePath}/${logoPath}`;
  const illustrationSrc = `${basePath}/${illustrationPath}`;

  const handleClose = () => {
    onClose?.();
  };

  const handleDownload = async () => {
    const target = document.getElementById(downloadId);
    if (!target) return;
    const scale = 1.5;
    const obj = {
      height: target.offsetHeight * scale,
      width: target.offsetWidth * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`
      }
    };
    // 第一次 toPng 拉取并缓存图片资源，第二次调用才能生成完整截图
    await domtoimage.toPng(target, obj).catch(() => { });
    domtoimage.toPng(target, obj).then((base64) => {
      if (isApp()) {
        const bridgeParams = {
          methodName: 'shareBase64',
          moduleName: '_b_bridge_Share_',
          uniqueId: null,
          params: { base64, text: '', title: '' }
        };
        (window as any)?.flutter_inappwebview?.callHandler(
          '_b_bridge_Share_',
          JSON.stringify(bridgeParams)
        );
        return;
      }
      const link = document.createElement('a');
      link.download = `invite_${referralInfo?.inviteCode || ''}.png`;
      link.href = base64;
      link.click();
    });
  };

  return (
    <Modal
      open={modalOpen}
      centered
      maskClosable={false}
      onCancel={null}
      closeIcon={null}
      width={isMobile ? 'calc(100% - 32px)' : 608}
      footer={null}
      styles={{
        content: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          padding: 0
        }
      }}
    >
      <div className="flex flex-col">
        {/* close button */}
        <button
          onClick={handleClose}
          className="ml-auto w-6 h-6 rounded-full shrink-0 border-0 p-0 cursor-pointer bg-no-repeat bg-center transition-opacity duration-200 hover:opacity-70"
          style={{ backgroundImage: `url("${CLOSE_ICON}")`, backgroundSize: '24px 24px' }}
        />

        {/* card body — excluded from screenshot scope via id */}
        <div
          id={downloadId}
          className="my-4 w-full overflow-hidden rounded-xl border border-[var(--line-border-default,#28292a)] bg-[var(--bg-primary,#080808)]"
        >
          {/* card design top */}
          <div className="flex flex-col items-start px-6 pt-4 max-md:px-4">
            <img
              className="block w-[120px] h-7 object-contain max-md:mb-6"
              src={logoSrc}
              alt="EasiCoin"
            />
            {/* content row: title left, illustration right */}
            <div className="flex flex-row items-center justify-between w-full gap-6 max-md:flex-col max-md:gap-4 max-md:pb-4">
              <div className="flex flex-col items-start flex-1 justify-center max-w-[238px] max-md:max-w-full max-md:-order-1">
                {shareTextContent ?? (
                  <div
                    className="text-[var(--text-primary,#f5f5f5)] text-2xl max-md:text-[22px] font-bold leading-normal m-0 max-w-full"
                    dangerouslySetInnerHTML={{ __html: shareTextHtml }}
                  />
                )}
              </div>
              <div className="w-[228px] h-[228px] shrink-0 max-md:w-[196px] max-md:h-[196px] max-md:order-1">
                <img
                  src={illustrationSrc}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* invite info: qrcode + invite code */}
          <div className="flex w-full items-center gap-4 px-6 py-3 max-md:px-4 max-md:py-2 max-md:gap-3">
            <div className="p-1 bg-white rounded-[2px] shrink-0 max-md:order-1">
              <div className="relative flex leading-none">
                <QRCode
                  level="H"
                  size={isMobile ? 49 : 56}
                  value={referralInfo?.inviteLink || ''}
                />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-1.5 flex-1">
              <div className="text-[var(--text-static-white,#fff)] text-xs leading-[18px]">
                {inviteCodeLabel}
              </div>
              <div className="text-[var(--text-static-white,#fff)] text-[22px] font-bold leading-5">
                {referralInfo?.inviteCode || ''}
              </div>
            </div>
          </div>
        </div>

        <SocialShareActions
          inviteLink={referralInfo?.inviteLink}
          inviteCode={referralInfo?.inviteCode}
          onDownload={handleDownload}
        />
      </div>
    </Modal>
  );
};

export default ReferralShareModal;
