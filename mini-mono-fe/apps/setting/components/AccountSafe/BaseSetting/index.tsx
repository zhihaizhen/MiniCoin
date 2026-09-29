//@ts-nocheck
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Button, message } from 'antd';
import copy from 'copy-to-clipboard';
import cls from 'classnames';
import dayjs from 'dayjs';
import { basePath, getLang } from '@better-bit-fe/base-utils';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  EyeOutlined,
  EyeInvisibleOutlined,
  RightOutlined,
  CloseCircleFilled
} from '@ant-design/icons';
import { fetchEmail, toGetUserPreferences } from '~/api';
import { useFm } from '@better-bit-fe/base-hooks';
import { useUserInfo } from '@better-bit-fe/base-provider';
import VerifyModalGather from '~/components/VerifyModalGather';
import TwoFa from '~/components/2fa';
import { useRouter } from 'next/router';
import { getSecurityLevel } from '~/utils/securityLevel';
import Style from './index.module.less';
import {ReactComponent as RadioIcon} from '~/public/images/radio.svg';

import {ReactComponent as PwdIcon} from '~/public/images/accountSafe/pwd.svg';
import {ReactComponent as MobileIcon} from '~/public/images/accountSafe/mobile.svg';
import {ReactComponent as GoogleIcon} from '~/public/images/accountSafe/google.svg';
import {ReactComponent as PasskeyIcon} from '~/public/images/accountSafe/passkey.svg';
import {ReactComponent as EmailIcon} from '~/public/images/accountSafe/email.svg';
import {ReactComponent as TradingViewIcon} from '~/public/images/accountSafe/tradingView.svg';
import {ReactComponent as ExclamationCircleFilledIcon} from '~/public/images/accountSafe/ExclamationCircleFilled.svg';
import {ReactComponent as CheckedIcon} from '~/public/images/accountSafe/checked.svg';

const EYE_ICON_STYLE = {
  cursor: 'pointer',
  opacity: '.5',
  marginLeft: '8px',
  display: 'inline-block'
};

const Card = ({ title, children }: { title?: ReactNode; children: ReactNode }) => (
  <section className={Style.card}>
    {title && <h2 className={Style.cardTitle}>{title}</h2>}
    {children}
  </section>
);

const SECURITY_CHECKS = [
  { field: 'email_is_verified', labelKey: 'emailVerify' },
  { field: 'mobile_is_verified', labelKey: 'phoneVerify' },
  { field: 'google2fa_is_verified', labelKey: 'googleAuthenticator' },
  { field: 'passkey_is_verified', labelKey: 'passkey' }
] as const;

const SECURITY_LEVELS = {
  low: { labelKey: 'risk.low', color: 'var(--text-red, #FA465B)' },
  medium: { labelKey: 'risk.medium', color: '#FF7738' },
  high: { labelKey: 'risk.high', color: '#72CC29' }
};

const RING_SIZE = 56;
const RING_STROKE = 4;

const SecurityRing = ({
  count,
  total,
  color
}: {
  count: number;
  total: number;
  color: string;
}) => {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={Style.securityRing}>
      <svg width={RING_SIZE} height={RING_SIZE}>
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke="var(--line-divider-primary, #eee)"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${(count / total) * circumference} ${circumference}`}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </svg>
      <span className={Style.securityRingText}>
        {count}/{total}
      </span>
    </div>
  );
};

const SecurityLevelCard = ({ userInfo, t }) => {
  const verifiedCount = SECURITY_CHECKS.filter(
    (item) => userInfo?.[item.field]
  ).length;
  const level = SECURITY_LEVELS[getSecurityLevel(userInfo)];
  return (
    <Card>
      <div className={Style.securityLevelCard}>
        <div className={Style.securityLevelSummary}>
          <SecurityRing
            count={verifiedCount}
            total={SECURITY_CHECKS.length}
            color={level.color}
          />
          <div>
            <div
              className={Style.securityLevelText}
              style={{ color: level.color }}
            >
              {t(level.labelKey)}
            </div>
            <div className={Style.securityLevelLabel}>{t('kyc.risk')}</div>
          </div>
        </div>
        <div className={Style.securityChecklist}>
          {SECURITY_CHECKS.map((item) => (
            <div key={item.field} className={Style.securityCheckItem}>
              <RadioIcon className={cls(Style.securityCheckIcon, !userInfo?.[item.field] && Style.securityCheckIconMuted)} />
              {t(item.labelKey)}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const SettingItem = ({
  iconClassName,
  title,
  desc,
  status,
  operation,
  svgIcon
}: {
  iconClassName: string;
  title: ReactNode;
  desc: ReactNode;
  status?: ReactNode;
  operation: ReactNode;
  svgIcon?: ReactNode;
}) => (
  <div className={Style.settingItemContainer}>
    <div className={Style.settingItem}>
      <div className={Style.settingItemIcon}>
        {iconClassName && <span className={cls(Style.icon, iconClassName)} />}
        {svgIcon && <span className={Style.svgIcon}>{svgIcon}</span>}
      </div>
      <div className={Style.settingItemContent}>
        <div className={Style.settingItemContentTitle}>{title}</div>
        <div className={Style.settingItemContentDesc}>{desc}</div>
      </div>
      {status && (
        <div className={Style.settingItemStatus}>
          <div>{status}</div>
        </div>
      )}
      <div className={Style.settingItemOperation}>{operation}</div>
    </div>
  </div>
);

const ActionButton = ({
  children,
  type,
  onClick
}: {
  children: ReactNode;
  type?: 'primary' | '';
  onClick: () => void;
}) => (
  <span className={Style.ctaContainer}>
    <Button
      className={Style['accountInfo-btn']}
      type={type}
      onClick={onClick}
    >
      {children}
    </Button>
  </span>
);

const SuccessStatus = ({ children }: { children: ReactNode }) => (
  <div className={Style.successStatus}>
    <CheckedIcon className={Style.successIcon} />
    {children}
  </div>
);

const UnsetStatus = ({ children }: { children: ReactNode }) => (
  <div className={Style.unsetStatus}>
    <ExclamationCircleFilledIcon className={Style.unsetIcon} />
    {children}
  </div>
);

// KYC状态显示组件
const KycStatusDisplay = ({ kycStatus, t, router }) => {
  if (!kycStatus || kycStatus === 'unknown') {
    return null;
  }

  const statusConfig = {
    passed: {
      icon: <CheckCircleFilled style={{ color: '#2EBD85', marginRight: '4px', fontSize: '14px' }} />,
      textClass: Style.kycVerified,
      textKey: t('setting.kyc_verified')
    },
    pending: {
      icon: <ExclamationCircleFilled style={{ color: '#F5841F', marginRight: '4px', fontSize: '14px' }} />,
      textClass: Style.kycText,
      textKey: t('setting.kyc_pending')
    },
    rejected: {
      icon: <CloseCircleFilled style={{ color: '#E85461', marginRight: '4px', fontSize: '14px' }} />,
      textClass: Style.kycText,
      textKey: t('setting.kyc_rejected')
    },
    default: {
      icon: <ExclamationCircleFilled style={{ color: '#F5841F', marginRight: '4px', fontSize: '14px' }} />,
      textClass: Style.kycText,
      textKey: t('setting.kyc_unverified')
    }
  };

  const config = statusConfig[kycStatus] || statusConfig.default;

  return (
    <div className={Style.subRowItem}>
      <div className={Style.itemTitle}>{t('setting.kyc')}</div>
      <div className={cls(Style.itemDesc, Style.kycStatus)}>
        <div className={Style.kycStatusItem} onClick={() => router.push('/setting/kyc')}>
          {config.icon}
          <div className={config.textClass} style={{ marginRight: '4px' }}>
            {config.textKey}
          </div>
          <RightOutlined style={{ color: '#A6A6A6', fontSize: '14px' }} />
        </div>
      </div>
    </div>
  );
};


const PasswordSetting = ({ t, onChange }) => (
  <SettingItem
    svgIcon={<PwdIcon />}
    title={t('AccountInfo-title-item7')}
    desc={t('pwdDesc')}
    status={<SuccessStatus>{t('alreadySetting')}</SuccessStatus>}
    operation={
      <ActionButton onClick={onChange}>
        {t('AccountInfo-changeBtn')}
      </ActionButton>
    }
  />
);

const EmailSetting = ({
  userInfo,
  t,
  showEmail,
  userEmail,
  onToggleEmail,
  onBindEmail,
  onUnbindEmail
}) => (
  <SettingItem
    svgIcon={<EmailIcon />}
    title={t('emailVerify')}
    desc={t('emailDesc')}
    status={
      userInfo?.vague_email ? (
        <div className={Style.successStatus}>
          <CheckedIcon className={Style.successIcon} />
          <span>{showEmail ? userEmail : userInfo?.vague_email}</span>
          <span style={EYE_ICON_STYLE} onClick={onToggleEmail}>
            {showEmail ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </span>
        </div>
      ) : (
        <UnsetStatus>{t('AccountInfo-notSet')}</UnsetStatus>
      )
    }
    operation={
      userInfo?.vague_email ? (
        <ActionButton onClick={onUnbindEmail}>
          {t('AccountInfo-unbindBtn')}
        </ActionButton>
      ) : (
        <ActionButton onClick={() => onBindEmail()}>
          {t('AccountInfo-setBtn')}
        </ActionButton>
      )
    }
  />
);

const PhoneSetting = ({ userInfo, t, onBindPhone, onUnbindPhone }) => (
  <SettingItem
    svgIcon={<MobileIcon />}
    title={t('phoneVerify')}
    desc={t('phoneDesc')}
    status={
      userInfo?.vague_mobile ? (
        <SuccessStatus>{userInfo?.vague_mobile}</SuccessStatus>
      ) : (
        <UnsetStatus>{t('AccountInfo-notSet')}</UnsetStatus>
      )
    }
    operation={
      userInfo?.vague_mobile ? (
        <ActionButton onClick={onUnbindPhone}>
          {t('AccountInfo-unbindBtn')}
        </ActionButton>
      ) : (
        <ActionButton onClick={() => onBindPhone()}>
          {t('AccountInfo-setBtn')}
        </ActionButton>
      )
    }
  />
);

const TwoFaSetting = ({ userInfo, t, onSetup, onUnbind }) => (
  <SettingItem
    svgIcon={<GoogleIcon />}
    title={
      <>
        {t('googleAuthenticator')}
        <span className={Style.recommendTag}>{t('recommendTag')}</span>
      </>
    }
    desc={t('googleDesc')}
    status={
      userInfo?.google2fa_is_enabled ? (
        <SuccessStatus>{t('alreadySetting')}</SuccessStatus>
      ) : (
        <UnsetStatus>{t('AccountInfo-notSet')}</UnsetStatus>
      )
    }
    operation={
      userInfo?.google2fa_is_enabled ? (
        <ActionButton onClick={onUnbind}>
          {t('AccountInfo-unbindBtn')}
        </ActionButton>
      ) : (
        <ActionButton onClick={onSetup}>{t('goSetting')}</ActionButton>
      )
    }
  />
);

const TradingViewSetting = ({ t, onView }) => (
  <SettingItem
    svgIcon={<TradingViewIcon />}
    title={t('tradingviewSignal')}
    desc={t('tradingViewDesc')}
    operation={
      <ActionButton onClick={onView}>{t('viewBtn')}</ActionButton>
    }
  />
);

const PasskeySetting = ({ userInfo, t, onManage }) => {
  const isVerified = Boolean(userInfo?.passkey_is_verified);

  return (
    <SettingItem
      svgIcon={<PasskeyIcon />}
      title={t('passkey-title')}
      desc={t('passkey-desc')}
      status={
        isVerified ? (
          <SuccessStatus>{t('passkey-status-on')}</SuccessStatus>
        ) : (
          <UnsetStatus>{t('passkey-status-off')}</UnsetStatus>
        )
      }
      operation={
        <ActionButton onClick={onManage}>
          {isVerified ? t('passkey-manage') : t('passkey-bind')}
        </ActionButton>
      }
    />
  );
};

const BaseSetting: React.FC = () => {
  const t = useFm();
  const bindPhoneRef = useRef();
  const bindEmailRef = useRef();
  const TwoFaRef = useRef();
  const unbindEmailRef = useRef();
  const unbindPhoneRef = useRef();
  const { userInfo, isLogin, updateUserInfo } = useUserInfo();
  const [showEmail, setshowEmail] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState('');
  const curLang = getLang();
  const router = useRouter();
  const [vipLevel, setVipLevel] = useState(0);
  const [emailClicked, setEmailClicked] = useState(false);
  const [phoneClicked, setPhoneClicked] = useState(false);
  const [unbindEmailClicked, setUnbindEmailClicked] = useState(false);
  const [unbindPhoneClicked, setUnbindPhoneClicked] = useState(false);

  const pendingPhoneAction = useRef<boolean | null>(null);
  const pendingEmailAction = useRef<boolean | null>(null);
  const pendingUnbindEmail = useRef(false);
  const pendingUnbindPhone = useRef(false);

  function setUp2fa() {
    if (!isLogin) return;
    TwoFaRef.current.setUp2fa();
  }

  function handleUnbind2fa() {
    if (!isLogin) return;
    TwoFaRef.current.changeUnbindModalVisible(true, '2fa');
  }

  function setupEmail(updateEmail = false) {
    if (!isLogin) return;
    bindEmailRef.current.changeModalVisible(true, updateEmail);
  }

  function setupPhone(updatePhone = false) {
    if (!isLogin) return;
    bindPhoneRef.current.changeModalVisible(true, updatePhone);
  }

  function getCanEdit(time) {
    const today = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const lastDay = dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss');
    const intervalDay = dayjs(today).diff(lastDay, 'day');
    if (intervalDay < 7) {
      message.error(t('modifiedTip'));
      return false;
    }
    return true;
  }


  const handleShowEmail = async () => {
    const { email } = await fetchEmail();
    setUserEmail(email);
    setshowEmail(!showEmail);
  };


  function handleCopy(value: string) {
    if (!isLogin) return;
    copy(value);
    message.success(t('copyTips'));
  }

  const handleClickPhoneBtn = (updatePhone = false) => {
    if (!isLogin) return;
    if (phoneClicked) {
      setupPhone(updatePhone);
    } else {
      pendingPhoneAction.current = updatePhone;
      setPhoneClicked(true);
    }
  };

  useEffect(() => {
    if (phoneClicked && pendingPhoneAction.current !== null) {
      setupPhone(pendingPhoneAction.current);
      pendingPhoneAction.current = null;
    }
  }, [phoneClicked]);

  const handleClickEmailBtn = (updateEmail = false) => {
    if (!isLogin) return;
    if (emailClicked) {
      setupEmail(updateEmail);
    } else {
      pendingEmailAction.current = updateEmail;
      setEmailClicked(true);
    }
  };

  useEffect(() => {
    if (emailClicked && pendingEmailAction.current !== null) {
      setupEmail(pendingEmailAction.current);
      pendingEmailAction.current = null;
    }
  }, [emailClicked, setupEmail]);

  const handleUnbindEmail = () => {
    if (!isLogin) return;
    if (unbindEmailClicked) {
      unbindEmailRef.current?.changeModalVisible(true);
    } else {
      pendingUnbindEmail.current = true;
      setUnbindEmailClicked(true);
    }
  };

  const gotoPasskey = () => {
    const locale = router.locale;
    // 未绑定 passkey 时（点击「绑定」而非「管理」），passkey 页无需再拉 list 接口
    const query = userInfo?.passkey_is_verified ? '' : '?skipList=1';
    router.push(`/${locale}${basePath}/account-safe/passkey${query}`);
  };

  useEffect(() => {
    if (unbindEmailClicked && pendingUnbindEmail.current) {
      unbindEmailRef.current?.changeModalVisible(true);
      pendingUnbindEmail.current = false;
    }
  }, [unbindEmailClicked]);

  const handleUnbindPhone = () => {
    if (!isLogin) return;
    if (unbindPhoneClicked) {
      unbindPhoneRef.current?.changeModalVisible(true);
    } else {
      pendingUnbindPhone.current = true;
      setUnbindPhoneClicked(true);
    }
  };

  useEffect(() => {
    if (unbindPhoneClicked && pendingUnbindPhone.current) {
      unbindPhoneRef.current?.changeModalVisible(true);
      pendingUnbindPhone.current = false;
    }
  }, [unbindPhoneClicked]);

  const handleUnbindSuccess = () => {
    updateUserInfo();
  };

  const handlePwdChange = () => {
    const { vague_email, google2fa_is_enabled, vague_mobile } = userInfo;
    if (!vague_email) {
      handleClickEmailBtn();
      return;
    }
    if (!google2fa_is_enabled && !vague_mobile) {
      message.info(t('bindGaOrMobile'));
      return;
    }
    const locale = router.locale;
    router.push(`/${locale}${basePath}/change-password`);
  };

  const gotoTradingViewSignal = () => {
    const locale = router.locale;
    router.push(`/${locale}${basePath}/account-safe/tradingview-signal`);
  };

  useEffect(() => {
    const trigger2fa = new URLSearchParams(window.location.search).get('2fa');
    if (trigger2fa == 1) {
      setTimeout(() => {
        setUp2fa();
      }, 1000);
    }
  }, []);

  useEffect(() => {
    toGetUserPreferences(['vipLevel']).then((data) => {
      setVipLevel(+data.preferences?.vipLevel || 0);
    });
  }, []);

  return (
    <>
      <div className={Style.accountInfo}>
        <SecurityLevelCard userInfo={userInfo} t={t} />

        <Card title={t('baseSecuritySetting')}>
          <PasswordSetting t={t} onChange={handlePwdChange} />
          <EmailSetting
            userInfo={userInfo}
            t={t}
            showEmail={showEmail}
            userEmail={userEmail}
            onToggleEmail={handleShowEmail}
            onBindEmail={handleClickEmailBtn}
            onUnbindEmail={handleUnbindEmail}
          />
          <PhoneSetting
            userInfo={userInfo}
            t={t}
            onBindPhone={handleClickPhoneBtn}
            onUnbindPhone={handleUnbindPhone}
          />

          <PasskeySetting
            userInfo={userInfo}
            t={t}
            onManage={gotoPasskey}
          />
        </Card>

        <Card title={t('advanceSetting')}>
          <TwoFaSetting
            userInfo={userInfo}
            t={t}
            onSetup={setUp2fa}
            onUnbind={handleUnbind2fa}
          />
        </Card>

        <Card title={t('accountExtension')}>
          <TradingViewSetting t={t} onView={gotoTradingViewSignal} />
        </Card>
      </div>
      {emailClicked && <VerifyModalGather ref={bindEmailRef} scene="bind_email" />}
      {phoneClicked && <VerifyModalGather ref={bindPhoneRef} scene="bind_mobile" />}
      {unbindEmailClicked && <VerifyModalGather ref={unbindEmailRef} scene="unbind_email" onSuccess={handleUnbindSuccess} />}
      {unbindPhoneClicked && <VerifyModalGather ref={unbindPhoneRef} scene="unbind_mobile" onSuccess={handleUnbindSuccess} />}
      {/* 手机号登录和tg登录逻辑保持一致 */}
      <TwoFa ref={TwoFaRef} loginType={userInfo?.vague_email ? 1 : 3} />
    </>
  );
};

export default BaseSetting;
