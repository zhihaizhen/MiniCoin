/* eslint-disable react/no-danger */
// @ts-nocheck
import copy from 'copy-to-clipboard';
import { Checkbox, message } from 'common/antdComponents';
import { ORDER_ACTION } from 'common/packages-biz/global-settings/usdt-settings';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store-hooks/use-user-store';
import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useState,
} from 'react';
import domtoimage from 'dom-to-image';
import BigNumber from 'bignumber.js';
import cls from 'classnames';
import QRCode from 'react-qr-code';
import dayjs from 'dayjs';
import { ReactComponent as DownLoadSvg } from '@/assets/trade-share/download.svg';
import { ReactComponent as SaveImageSvg } from '@/assets/trade-share/saveImage.svg';
import { ReactComponent as CopyLinkSvg } from '@/assets/trade-share/copyLink.svg';
import myAvatar from '@/assets/trade-share/default_avatar.png';
import { getRandomId, popupNewWindow, SOCIAL_SHARE_URL } from './helper';

import winBg1 from '@/assets/trade-share/winbg1.png';
import winBg2 from '@/assets/trade-share/winbg2.png';
import winBg3 from '@/assets/trade-share/winbg3.png';
import lossBg1 from '@/assets/trade-share/lossbg1.png';
import lossBg2 from '@/assets/trade-share/lossbg2.png';
import lossBg3 from '@/assets/trade-share/lossbg3.png';

import './index.less';

const medias = [
  'twitter',
  'telegram',
  'facebook',
  'instagram',
  'discord',
  'medium',
];

const Modal = ({
  avatar,
  username,
  invitesInfo,
  data,
  onClose,
  t,
  type,
}: any) => {
  const { balanceFraction = 4, priceFraction = 2, walletCoin } = data;
  const [imgItemShow, setImgItemShow] = useState({
    lvg: true,
    price: true,
    pnl: false,
    nickname: false,
    whiteMode: false,
  });
  const [initialBgImg, setInitialBgImg] = useState();
  const [t1] = useTranslation();
  const winBgImages = useMemo(() => [winBg1, winBg2, winBg3], []);
  const lossBgImages = useMemo(() => [lossBg1, lossBg2, lossBg3], []);

  useEffect(() => {
    const img = new Image();
  
    const randomIndex = Math.floor(Math.random() * 3);
    if(BigNumber(isPosition ? data?.unrealisedPnlE8 : data?.roiE4)
      ?.dividedBy(1e8)
      ?.gt(0)){
      img.src = winBgImages[randomIndex];
    } else {
      img.src = lossBgImages[randomIndex];
    }
    img.onload = () => {
      setInitialBgImg(img.src);
    };
}, [winBgImages, lossBgImages,data?.unrealisedPnlE8, data?.roiE4]);

  const downloadId = useMemo(() => getRandomId(), []);
  const isPosition = useMemo(() => type === 'position', [type]);
  const side = useMemo(() => {
    if (isPosition) {
      if (data?.side?.toLowerCase() === 'buy') return 'long';
      if (data?.side?.toLowerCase() === 'sell') return 'short';
    }

    if (data?.side?.toLowerCase() === 'buy') return 'short';
    if (data?.side?.toLowerCase() === 'sell') return 'long';
    return '-';
  }, [data, isPosition]);

  const profit = useMemo(() => {
    if (isPosition) {
      const pm = BigNumber(
        Math.max(data?.minPositionCost, data?.positionBalance),
      );
      const pnl = BigNumber(data?.unrealisedPnlE8)?.dividedBy(1e8);
      const roi = pnl?.dividedBy(pm)?.multipliedBy(100);
      const res = { pnl, roi };
      return res;
    }
    // 平仓盈亏
    const { avgEntryPrice, cumClosedSizeX, leverageE2, closedPnl } = data;
    // // 保证金 = 仓位价值/杠杆
    // // 盈利率 = 盈亏/保证金
    // const pm = BigNumber(avgEntryPrice)?.multipliedBy(size)?.dividedBy(leverage);
    const pnl = BigNumber(closedPnl); //
    const roi = BigNumber(data?.roiE4)?.dividedBy(1e2);
    return { pnl, roi };
  }, [data, isPosition]);

  // 获取收益率
  const roiString = useMemo(() => {
    const { roi } = profit;
    if (roi.isNaN() || !roi?.isFinite()) {
      return '--';
    }

    if (roi?.gt(0)) {
      return `+${roi.toFormat(2)}%`;
    }

    return `${roi.toFormat(2)}%`;
  }, [profit]);

  // 获取盈亏金额
  const pnlString = useMemo(() => {
    const { pnl } = profit;
    if (pnl.isNaN() || !pnl?.isFinite()) {
      return '--';
    }
    if (pnl?.gt(0)) {
      return `+${pnl.toFormat(balanceFraction, BigNumber.ROUND_DOWN)}`;
    }
    return `${pnl.toFormat(balanceFraction, BigNumber.ROUND_DOWN)}`;
  }, [profit]);

  const shareText = useMemo(() => t('shareText'));

  const handleClose = () => {
    onClose?.();
  };

  const handleCopyLink = () => {
    if (!invitesInfo?.inviteLink) return;
    copy(invitesInfo?.inviteLink);
    message.success(t1('copied'));
  };

  const handleDownload = () => {
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
        height: `${target.offsetHeight}px`,
      },
    };
    domtoimage.toPng(target, obj).then((dataUrl) => {
      const link = document.createElement('a');
      const title = process.env.TITLE || process.env.MARVEL_APP_TITLE;
      link.download = `${title}_trade_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  const formatNumber = (v, { refine = 0, decimal = 0 }) => {
    let num = BigNumber(v);
    if (num.isNaN() || !num?.isFinite()) {
      return '-';
    }
    if (refine) {
      num = num?.dividedBy(refine);
    }
    if (decimal) {
      return num.toFormat(decimal, BigNumber.ROUND_DOWN);
    }

    return num.toFormat();
  };

  // 控制图片上展示的内容
  const handleImgShowChange = (e, type) => {
    const { checked } = e.target;
    // if (type === 'whiteMode') {
    //   // 每次预加载完图片后，才设置背景图片，防止首次闪屏
    //   const img = new Image();
    //   img.src = checked ? bgImageWhite : bgImage;
    //   img.onload = () => {
    //     setInitialBgImg(img.src);
    //   };
    // }
    setImgItemShow({
      ...imgItemShow,
      [type]: checked,
    });
  };

  const handleClickMedia = (m) => {
    if (!invitesInfo?.inviteLink) return;
    let url = '';
    switch (m) {
      case 'twitter':
        url = `${SOCIAL_SHARE_URL.twitter}?url=${
          invitesInfo?.inviteLink
        }&text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `${SOCIAL_SHARE_URL.facebook}?u=${
          invitesInfo?.inviteLink
        }&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'telegram':
        url = `${SOCIAL_SHARE_URL.telegram}?url=${
          invitesInfo?.inviteLink
        }&text=${encodeURIComponent(shareText)}`;
        break;
      case 'discord':
        url = SOCIAL_SHARE_URL.discord;
        break;
      case 'instagram':
        url = SOCIAL_SHARE_URL.instagram;
        break;
      case 'medium':
        url = SOCIAL_SHARE_URL.medium;
        break;
      default:
        break;
    }
    popupNewWindow(url);
  };

  const getPrice = () => {
    if (!isPosition) {
      return {
        label: t1('exitPrice'),
        value: data?.avgExitPrice,
      };
    }
    if (data?.upnlBaceCalc === '1') {
      return {
        label: t('mark-price'),
        value: data?.showPrice,
      };
    }

    return {
      label: t('last-price'),
      value: data?.showPrice,
    };
  };

  return (
    <div
      className={cls('trade-share-modal', {
        'white-mode-modal': imgItemShow.whiteMode,
      })}
    >
      <div className="trade-share-modal-content">
        <div className="trade-share-modal-content-wrapper">
          <div className="trade-share-modal-close" onClick={handleClose} />
          <div className="trade-share-modal-body" id={downloadId}>
            {/* 上下布局 */}
            <div
              className="trade-share-modal-card"
              style={{
                backgroundImage: `url(${initialBgImg})`,
              }}
            >
              {/* 分享信息 */}
              <div className="trade-share-modal-card-info">
                <div className="time">
                  {/* <span >{t('shareDate')}: </span> */}
                  <span>{dayjs().format('YYYY-MM-DD HH:mm')}</span>
                </div>

                {/* 代理商展示代理商的别名，普通用户展示用户名 */}
                <div className="user">
                  <img src={avatar || myAvatar} alt="avatar" className="icon" />
                  {imgItemShow.nickname && (
                    <div className="username">
                      {invitesInfo?.inviteNickName || username}
                    </div>
                  )}
                </div>

                {/* 交易基本信息 */}
                <div className="trade">
                  <div
                    className={cls('side', {
                      pov: side === 'long',
                      neg: side === 'short',
                    })}
                  >
                    {t(side)}
                  </div>
                  {imgItemShow.lvg && (
                    <>
                      {' '}
                      <div className="divider" />
                      <div className="value">
                        {formatNumber(data?.leverageE2, { refine: 1e2 })}x
                      </div>
                    </>
                  )}
                  <div className="divider" />
                  <div className="value">
                    {data?.symbolAlias}
                    {t1('perpetual')}
                  </div>
                </div>
                {/* 盈利率 */}
                <div
                  className={cls('pnlPercent', {
                    lg: true,
                    pov: profit?.roi?.gt(0),
                    neg: profit?.roi?.lt(0),
                  })}
                >
                  {roiString}
                </div>
                {/* 盈亏金额 */}
                {imgItemShow.pnl && (
                  <div
                    className={cls('pnl', {
                      pov: profit?.pnl?.gt(0),
                      neg: profit?.pnl?.lt(0),
                    })}
                  >
                    {`${pnlString} ${walletCoin}`}
                  </div>
                )}
                {/* 价格 */}
                {imgItemShow.price && (
                  <div className="price">
                    <div className="price-item">
                      <div className="price-item-label">{t('entry-price')}</div>
                      <div className="price-item-value">
                        {formatNumber(data?.avgEntryPrice || data?.entryPrice, {
                          decimal: priceFraction,
                        })}
                      </div>
                    </div>
                    <div className="price-item">
                      <div className="price-item-label">
                        {getPrice()?.label}
                      </div>
                      <div className="price-item-value">
                        {formatNumber(getPrice()?.value, {
                          decimal: priceFraction,
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* 邀请信息 */}
              <div className="trade-share-modal-card-invites">
                <div className="qrcode">
                  <QRCode
                    size={60}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    value={invitesInfo?.inviteLink || ''}
                  />
                </div>
                <div className="desc">
                  <div className="desc-label">
                    {t('invites-code')}
                    <span>{invitesInfo?.inviteCode} </span>
                  </div>
                  <div className="desc-value">{t('invites-title')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="trade-share-modal-footer">
            {/* 可选展示的数据 */}
            <div className="trade-share-modal-input">
              <div className="trade-share-modal-input-label">
                {t('option-label')}
              </div>
              <div className="trade-share-modal-input-field">
                <Checkbox
                  checked={imgItemShow.lvg}
                  onChange={(val) => handleImgShowChange(val, 'lvg')}
                >
                  {t('shareLvg')}
                </Checkbox>
                <Checkbox
                  checked={imgItemShow.pnl}
                  onChange={(val) => handleImgShowChange(val, 'pnl')}
                >
                  {t('sharePnlAmount')}
                </Checkbox>
                <Checkbox
                  checked={imgItemShow.price}
                  onChange={(val) => handleImgShowChange(val, 'price')}
                >
                  {t('sharePrice')}
                </Checkbox>
                <Checkbox
                  checked={imgItemShow.nickname}
                  onChange={(val) => handleImgShowChange(val, 'nickname')}
                >
                  {t('nickname')}
                </Checkbox>
                {/* <Checkbox
                  checked={imgItemShow.whiteMode}
                  onChange={(val) => handleImgShowChange(val, 'whiteMode')}
                >
                  {t('whiteMode')}
                </Checkbox> */}
              </div>
            </div>
          </div>
          <div className="trade-share-modal-footer">
            <div className="trade-share-modal-action">
              <div className="mediaItem" onClick={handleDownload}>
                <div className="mediaIcon">
                  {/* <DownLoadSvg className="downLoadIcon" /> */}
                  <SaveImageSvg />
                </div>
                <span className="mediaName">{t('saveImage')}</span>
              </div>

              <div className="mediaItem" onClick={handleCopyLink}>
                <div className="mediaIcon">
                  <CopyLinkSvg />
                </div>
                <span className="mediaName">{t('copy-link')}</span>
              </div>

              {medias.map((m) => (
                <div
                  className="mediaItem"
                  key={m}
                  onClick={() => handleClickMedia(m)}
                >
                  <div className={cls('media', m)} />
                  <span className="mediaName">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
