import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef
} from 'react';
import { Button, message } from 'antd';
import copy from 'copy-to-clipboard';
import cls from 'classnames';
import dayjs from 'dayjs';
import Image from 'next/image';
import { useRouter } from 'next/router';
import {
  CloseCircleFilled,
  DownOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import TwoFa from '~/components/2fa';
import Style from './index.module.less';
import { ReactComponent as EditIcon } from '~/public/images/edit.svg';
import { ReactComponent as RiskIcon } from '~/public/images/risk.svg';
import { ReactComponent as CopyIcon } from '~/public/images/copy.svg';
import { ReactComponent as PassedIcon } from '~/public/images/passed.svg';
import { ReactComponent as CertifyIcon } from '~/public/images/certify.svg';
import { ReactComponent as CertifyingIcon } from '~/public/images/certifying.svg';
import {
  UserInfo,
  TextFormatter,
  TwoFaRef,
  KycStatus, KycLevel
} from '~/interface';
import { FormattedMessage } from 'react-intl';
import { getCouponCount, getUserInviteInfo } from '~/api';
import EditProfileModal from '~/components/editProfileModal';
import { getSecurityLevel } from '~/utils/securityLevel';
import { getRejectionAlertMessageKey } from '~/utils/kycHelper';


const MOCK_DASHBOARD_DATA = {
  assetValue: '52,345.1234',
  assetApproxValue: '$52,345.1234',
  assetCurrency: 'USDT',
  referralRate: '20%',
  referralCode: 'SN3H69',
  coupons: {
    pending: 3,
    unused: 0
  },
  identityReward: '100 USDT'
};

const Card = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => <section className={cls(Style.card, className)}>{children}</section>;

const PrimaryButton = ({
  children,
  onClick
}: {
  children: ReactNode;
  onClick: () => void;
}) => (
  <Button className={Style.primaryButton} type="primary" onClick={onClick}>
    {children}
  </Button>
);

const SecondaryButton = ({
  children,
  onClick
}: {
  children: ReactNode;
  onClick: () => void;
}) => (
  <Button className={Style.secondaryButton} onClick={onClick}>
    {children}
  </Button>
);

const AccountSummary = ({
  userInfo,
  text,
  onEditAvatar,
  onEditNickName,
  onCopy
}: {
  userInfo: UserInfo;
  text: TextFormatter;
  onEditAvatar: () => void;
  onEditNickName: () => void;
  onCopy: (value?: string | number) => void;
}) => {
  const nickName = userInfo?.nick_name || 'EasiCoin_nGnhSiLy';
  // 初级已通过：Level1+passed，或已进入高级 Level2（含高级被拒，基础仍算通过）
  // Level1+rejected 视为未认证
  const isKycPending = userInfo?.kyc_status === KycStatus.Pending;
  const isKycCertified =
    userInfo?.kyc_level === KycLevel.Level2 ||
    (userInfo?.kyc_level === KycLevel.Level1 &&
      userInfo?.kyc_status === KycStatus.Passed);
  const kycColorClass = useMemo(() => {
    if (isKycPending) return 'text-function-orange bg-[#FF7738]/12';
    if (isKycCertified) return 'text-text-brand-default-web bg-[#ABE127]/12';
    return 'text-text-tertiary bg-fill-tag-gray';
  }, [isKycPending, isKycCertified]);
  const securityLevel = useMemo(
    () => getSecurityLevel(userInfo),
    [userInfo]
  );
  const riskColorClass = useMemo(() => {
    if (securityLevel === 'low') return 'text-text-red bg-fill-tag-red';
    if (securityLevel === 'medium') return 'text-function-orange! bg-[#FF7738]/12!';
    return 'text-text-brand-default-web! bg-[#ABE127]/12!';
  }, [securityLevel]);
  const riskLabelKey =
    securityLevel === 'low'
      ? 'risk.low'
      : securityLevel === 'medium'
        ? 'risk.medium'
        : 'risk.high';
  return (
    <div className={Style.accountHeader}>
      <div className={Style.profileBlock}>
        <button
          className={Style.avatarButton}
          type="button"
          aria-label={text('dashboard.editAvatar', 'Edit avatar')}
          onClick={onEditAvatar}
        >
          <Image
            className={Style.avatar}
            src={userInfo?.avatar || `${basePath}/images/default-avatar.svg`}
            alt={text('dashboard.avatarAlt', 'avatar')}
            width={64}
            height={64}
            unoptimized
            loader={({ src }) => src}
          />
        </button>
        <div>
          <div className={Style.profileNameRow}>
            <span className={Style.nickName}>{nickName}</span>
            <div className="text-text-secondary hover:cursor-pointer hover:text-text-brand-default-web mb-0.5" onClick={onEditNickName}>
              <EditIcon />
            </div>

          </div>
          <div className={Style.profileBadges}>
            <span className={cls(Style.kycBadge, kycColorClass)}>
              {isKycPending ? <CertifyingIcon /> : <CertifyIcon />}
              {text(
                isKycPending
                  ? 'kyc.certifying'
                  : isKycCertified
                    ? 'kyc.certified'
                    : 'kyc.un-certify',
                'certify'
              )}
            </span>
            {!!userInfo?.id && (
              <span className={cls(Style.riskBadge, riskColorClass)}>
                <RiskIcon />
                {text('kyc.risk', 'risk')} :
                {text(riskLabelKey, 'Security level')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className={Style.headerFields}>
        <div className="flex items-end gap-2">
          <div className={Style.headerField}>
            <div className={Style.fieldLabel}>UID</div>
            <div className={Style.fieldValue}>{userInfo?.id || ''}</div>
          </div>
          <div className="hover:cursor-pointer hover:text-text-brand-default-web mb-0.5"
            onClick={() => onCopy(userInfo?.id || '')}
          >
            <CopyIcon />
          </div>
        </div>

        <div className={Style.headerField}>
          <div className={Style.fieldLabel}>{text('registerAccount', 'Registered account')}</div>
          <div className={Style.fieldValue}>{userInfo?.vague_email || userInfo?.email || ''}</div>
        </div>
      </div>
    </div>
  );
};

const SecurityCenter = ({
  text,
  userInfo,
  onSetupPasskey,
  onGoogleVerify
}: {
  text: TextFormatter;
  userInfo: UserInfo;
  onSetupPasskey: () => void;
  onGoogleVerify: () => void;
}) => (
  <Card className={Style.securityCard}>
    <h2 className={Style.cardTitle}>
      {text('dashboard.securityCenter', 'Security Center')}
    </h2>
    <div className={Style.securityNotice}>
      <Image
        src={`${basePath}/images/security.png`}
        alt="security"
        width={36}
        height={36}
        unoptimized
      />
      {
        !userInfo?.google2fa_is_verified || !userInfo?.passkey_is_verified ? (
          <FormattedMessage
            id="dashboard.securityWeakTips"
            values={{
              g: (chunks) => {
                if (userInfo?.google2fa_is_verified) return null;
                return (
                  <button
                    className="cursor-pointer text-text-brand-default!"
                    onClick={onGoogleVerify}
                  >
                    {chunks}
                  </button>
                );
              },
              t: (chunks) => {
                if (userInfo?.passkey_is_verified) return null;
                return (
                  <button
                    className="cursor-pointer text-text-brand-default! ml-px"
                    onClick={onSetupPasskey}
                  >
                    {chunks}
                  </button>
                );
              }
            }}
          />
        ) : (
          <span>
            {text('dashboard.securityStrongTips', 'Your account security is strong')}
          </span>
        )
      }
    </div>
  </Card>
);

const IdentityCard = ({
  text,
  userInfo,
  onVerify
}: {
  text: TextFormatter;
  userInfo: UserInfo;
  onVerify: () => void;
}) => {
  const isPending = userInfo?.kyc_status === KycStatus.Pending;
  // 基础被拒才算未认证；level=2+rejected 基础已过，与徽章一致按已认证展示
  const isBasicRejected =
    userInfo?.kyc_level === KycLevel.Level1 &&
    userInfo?.kyc_status === KycStatus.Rejected;
  const isUncertified =
    userInfo?.kyc_level === KycLevel.Level0 || isBasicRejected;
  const isCertified =
    !isPending &&
    (userInfo?.kyc_level === KycLevel.Level2 ||
      (userInfo?.kyc_level === KycLevel.Level1 &&
        userInfo?.kyc_status === KycStatus.Passed));

  return (
    <Card className={Style.identityCard}>
      <div>
        <h2 className={`${Style.cardTitle} mb-3`}>
          {text('setting.idAuth', 'Identity Verification')}
        </h2>
        <div className="flex justify-between gap-2">
          {isUncertified && (
            <div>
              {isBasicRejected ? (
                <div className="flex items-start gap-2">
                  <span className="inline-flex h-[22px] shrink-0 items-center">
                    <CloseCircleFilled className="text-[14px] text-function-red!" />
                  </span>
                  <p className={`${Style.cardDesc} text-function-red!`}>
                    {text(
                      getRejectionAlertMessageKey({
                        kyc_level: userInfo?.kyc_level,
                        kyc_status: userInfo?.kyc_status
                      }),
                      ''
                    )}
                  </p>
                </div>
              ) : (
                <p className={Style.cardDesc}>
                  {text(
                    'setting.identityRewardTips',
                    `Complete identity verification to get a  futures trial bonus!`
                  )}
                </p>
              )}
              <div className="mt-8">
                <PrimaryButton onClick={onVerify}>
                  {isBasicRejected
                    ? text('setting.reVerify', 'Re-verify')
                    : text('setting.toVerify', 'Verify Now')}
                </PrimaryButton>
              </div>
            </div>
          )}
          {isCertified && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mt-5">
                <PassedIcon className="shrink-0" />
                <p className={Style.cardDesc}>
                  {text('setting.identityVerifyingTips1', `Your identity verification is under review. Please wait for the result.`)}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <PassedIcon className="shrink-0" />
                <p className={Style.cardDesc}>
                  {text('setting.identityVerifyingTips2', `Your identity verification is under review. Please wait for the result.`)}
                </p>
              </div>
            </div>
          )}
          {isPending && (
            <div>
              <div className="flex items-center gap-2 mt-5">
                <p className="text-[16px] text-text-primary font-medium">
                  {text('setting.identityVerifyingTips3', `Your identity verification is under review. Please wait for the result.`)}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <p className={Style.cardDesc}>
                  {text('setting.identityVerifyingTips4', `Your identity verification is under review. Please wait for the result.`)}
                </p>
              </div>
            </div>
          )}
          {[KycStatus.Pending, KycStatus.Unknown].includes(
            userInfo?.kyc_status
          ) && (
            <div className="relative w-[100px] h-[100px]">
              <Image
                src={`${basePath}/images/identityAuth.png`}
                alt="identity"
                width={100}
                height={100}
                unoptimized
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const AssetCard = ({
  text,
  onComingSoon
}: {
  text: TextFormatter;
  onComingSoon: () => void;
}) => (
  <Card className={Style.assetCard}>
    <div className={Style.assetLabel}>
      {text('dashboard.assetValue', 'Asset Value')}
      <span>({MOCK_DASHBOARD_DATA.assetCurrency})</span>
      <EyeOutlined />
    </div>
    <div className={Style.assetAmount}>
      {MOCK_DASHBOARD_DATA.assetValue}
      <span>
        {MOCK_DASHBOARD_DATA.assetCurrency}
        <DownOutlined />
      </span>
    </div>
    <div className={Style.assetApprox}>
      ≈ {MOCK_DASHBOARD_DATA.assetApproxValue}
    </div>
    <div className={Style.assetActions}>
      <PrimaryButton onClick={onComingSoon}>
        {text('dashboard.deposit', 'Deposit')}
      </PrimaryButton>
      <SecondaryButton onClick={onComingSoon}>
        {text('dashboard.withdraw', 'Withdraw')}
      </SecondaryButton>
      <SecondaryButton onClick={onComingSoon}>
        {text('dashboard.transfer', 'Transfer')}
      </SecondaryButton>
    </div>
  </Card>
);

const ReferralCard = ({
  text,
  inviteCode,
  onCopy,
  onReferral
}: {
  text: TextFormatter;
  inviteCode: string;
  onCopy: (value?: string | number) => void;
  onReferral: () => void;
}) => (
  <Card className={Style.referralCard}>
    <div className={Style.referralContent}>
      <h2 className={Style.cardTitle}>
        {text(
          'dashboard.referralTitle',
          `Invite friends and earn up to ${MOCK_DASHBOARD_DATA.referralRate} commission`
        )}
      </h2>
      <div className={Style.referralActions}>
        <PrimaryButton onClick={onReferral}>
          {text('dashboard.inviteReward', 'Invite Rewards')}
        </PrimaryButton>
        <button
          className={Style.inviteCode}
          type="button"
          onClick={() => onCopy(inviteCode)}
        >
          {text('dashboard.inviteCode', 'Invite Code')}:
          <strong>{inviteCode}</strong>
          <CopyIcon />
        </button>
      </div>
    </div>
    <div className={Style.referralIllustration}>
      <Image
        src={`${basePath}/images/referral.png`}
        alt="referral"
        width={100}
        height={100}
        unoptimized
      />
    </div>
  </Card>
);

const CouponCard = ({
  text,
  count,
  activedCount,
  onCouponPage
}: {
  text: TextFormatter;
  count: number;
  activedCount: number;
  onCouponPage: () => void;
}) => (
  <Card className={Style.couponCard}>
    <h2 className={Style.cardTitle}>{text('dashboard.coupons', 'Coupons')}</h2>
    <div className={Style.couponStats}>
      <div>
        <strong>{count}</strong>
        <span>{text('dashboard.pendingClaim', 'Pending claim')}</span>
      </div>
      <div>
        <strong>{activedCount}</strong>
        <span>{text('dashboard.pendingUse', 'Pending use')}</span>
      </div>
    </div>
    <div>
      <SecondaryButton onClick={onCouponPage}>
        {text('dashboard.view', 'View')}
      </SecondaryButton>
    </div>
  </Card>
);

const DashBoard: React.FC = () => {
  const t = useFm();
  const router = useRouter();
  const editProfileModalRef = useRef(null);
  const twoFaRef = useRef<TwoFaRef>(null);
  const { userInfo, isLogin } = useUserInfo() as {
    userInfo?: UserInfo;
    isLogin?: boolean;
  };

  const setUp2fa = useCallback(() => {
    if (!isLogin) return;
    twoFaRef.current?.setUp2fa();
  }, [isLogin]);

  const handleSetupPasskey = useCallback(() => {
    if (!isLogin) return;
    const locale = getLang();
    // 未绑定 passkey 时无需再拉 list 接口
    const query = userInfo?.passkey_is_verified ? '' : '?skipList=1';
    router.push(`/${locale}${basePath}/account-safe/passkey${query}`);
  }, [isLogin, router, userInfo?.passkey_is_verified]);

  const getCanEdit = useCallback(
    (time?: number) => {
      if (!time) return true;

      const today = dayjs().format('YYYY-MM-DD HH:mm:ss');
      const lastDay = dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss');
      const intervalDay = dayjs(today).diff(lastDay, 'day');

      if (intervalDay < 7) {
        message.error(t('modifiedTip', 'You can edit it once a week'));
        return false;
      }

      return true;
    },
    [t]
  );

  const handleEditProfile = useCallback(() => {

    if (!isLogin) return;
    const time = userInfo?.nick_name_last_updated_at || userInfo?.avatar_last_updated_at;
    if (getCanEdit(time)) {
      editProfileModalRef.current?.changeEditModalVisible(true);
    }
  }, [getCanEdit, isLogin, userInfo?.avatar_last_updated_at, userInfo?.nick_name_last_updated_at]);


  const handleCopy = useCallback(
    (value?: string | number) => {
      if (!isLogin || value === undefined || value === null) return;
      copy(String(value));
      message.success(t('copyTips', 'Copy successfully'));
    },
    [isLogin, t]
  );

  const handleVerify = useCallback(() => {
    const locale = getLang();
    router.push(`/${locale}${basePath}/kyc`);
  }, [router]);

  const handleReferralPage = () => {
    const lang = getLang();
    window.location.href = `/${lang}/referral`;
  };
  const handleCouponPage = () => {
    const lang = getLang();
    window.location.href = `/${lang}/rewards-hub/coupon-center`;
  };

  useEffect(() => {
    const trigger2fa = new URLSearchParams(window.location.search).get('2fa');

    if (trigger2fa === '1') {
      window.setTimeout(() => {
        setUp2fa();
      }, 1000);
    }
  }, [setUp2fa]);

  const [inviteInfo, setInviteInfo] = React.useState<any>(null);
  useEffect(() => {
    getUserInviteInfo().then(res => {
      setInviteInfo(res);
    })
  }, [])

  const [initCouponCount, setInitCouponCount] = React.useState(0);
  const [activedCouponCount, setActivedCouponCount] = React.useState(0);
  useEffect(() => {
    getCouponCount().then(res => {
      setInitCouponCount(res.init_count || 0);
      setActivedCouponCount(res.activated_count || 0);
    })
  }, []);

  return (
    <>
      <div className={Style.dashboard}>
        <AccountSummary
          userInfo={userInfo}
          text={t}
          onEditAvatar={handleEditProfile}
          onEditNickName={handleEditProfile}
          onCopy={handleCopy}
        />

        <div className={Style.topGrid}>
          <SecurityCenter
            text={t}
            userInfo={userInfo}
            onSetupPasskey={handleSetupPasskey}
            onGoogleVerify={setUp2fa}
          />
          <IdentityCard text={t} userInfo={userInfo} onVerify={handleVerify} />
        </div>

        {/*<AssetCard text={t} onComingSoon={handleComingSoon} />*/}

        <div className={Style.bottomGrid}>
          <ReferralCard
            text={t}
            inviteCode={inviteInfo?.inviteCode}
            onCopy={handleCopy}
            onReferral={handleReferralPage}
          />
          <CouponCard text={t} count={initCouponCount} activedCount={activedCouponCount} onCouponPage={handleCouponPage} />
        </div>
      </div>

      <EditProfileModal ref={editProfileModalRef} />
      <TwoFa ref={twoFaRef} loginType={userInfo?.vague_email ? 1 : 3} />
    </>
  );
};

export default DashBoard;
