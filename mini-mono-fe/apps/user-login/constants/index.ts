import { theme } from 'antd';

export enum EmailCodeType {
  bind_email = 'email_type_bind_email',
  bind_2fa = 'email_type_bind2fa_code',
  unbind_2fa = 'email_type_unbind2fa_code',
  login_code = 'email_type_login_code',
  reset_email = 'email_type_find_password'
}

export const bot_id = {
  local: '6069710838',
  test: '6069710838',
  testnet: '6184839965',
  prod: '6097730408',
  production: '6097730408'
};

export enum WalletType {
  none = 0,
  metamask = 1,
  unipass = 2,
  particle = 3
}

const STORAGE_ADDRESS = 'dex:address';
const STORAGE_KEY = 'dex:key';
const GA_UID = 'GA_UID';
const ISNEWUSER = 'isNewUser';
const AIRDROPTIPS = 'airDropTipsAlready';

export { STORAGE_ADDRESS, STORAGE_KEY, GA_UID, ISNEWUSER, AIRDROPTIPS };

export const AntThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorText: 'var(--text-primary, #FFFFFF)', //
    colorPrimary: 'var(--text-brand-default-web, #ABE127)', // 字体-主题色
    colorTextLightSolid: 'var(--text-white-to-back, #101112)', //
    colorBorder: 'var(--line-border-default, #28292A)', // 边框颜色
    borderRadius: 12 // 默认圆角大小
  },
  components: {
    Button: {
      contentFontSize: 16, // 按钮内容字体大小
      colorPrimary: 'var(--text-primary, #FFFFFF)', // 主色（按钮背景）
      colorPrimaryHover: 'var(--fill-button-primary-hover, #F5F5F5)', // hover 背景
      colorPrimaryActive: 'var(--fill-button-primary-default, #FFF);', // active 背景
      colorPrimaryText: 'var(--text-white-to-back, #101112)', // 文字颜色
      colorPrimaryTextHover: 'var(--text-white-to-back, #101112)',
      colorPrimaryTextActive: 'var(--text-white-to-back, #101112)',
      fontWeight: 500,
      // 禁用状态样式
      colorBgContainerDisabled: 'var(--fill-button-primary-disable, #28292A)', // 禁用时的背景色
      colorTextDisabled: 'var(--text-quartenary, #44484A)', // 禁用时的文字颜色
      borderColorDisabled: 'var(--fill-button-primary-disable, #28292A)', // 禁用时的边框颜色
      autoInsertSpaceInButton: false
    },
    Tabs: {
      itemSelectedColor: 'var(--text-brand-default-web, #ABE127)', // 选中的文字颜色
      itemActiveColor: 'var(--text-brand-default-web, #ABE127)', // 激活时文字颜色
      inkBarColor: 'var(--text-brand-default-web, #ABE127)', // 下划线颜色
      itemHoverColor: 'var(--text-brand-default-web, #ABE127)' // 标签悬浮态文本颜色
    },
    Input: {
      // 背景和边框
      colorBgContainer: 'var(--bg-primary, #070808)', //--bg-primary 输入框内部背景
      activeBg: 'var(--bg-primary, #070808)', //--bg-primary 输入框激活状态时背景颜色
      // 文本与占位符
      colorText: 'var(--text-primary, #FFFFFF)', // 输入内容颜色
      colorTextPlaceholder: 'var(--text-tertiary, #A8AAAD)', // 占位符
      activeBorderColor: 'var(--text-brand-default-web, #ABE127)', // 激活边框
      hoverBorderColor: 'var(--text-brand-default-web, #ABE127)' // hover边框
    },
    Modal: {
      // 这里写 Modal 专属的 token
      borderRadiusLG: 12, // 弹窗圆角
      // paddingContentHorizontal: 24,      // 内容左右内边距
      // paddingContentVertical: 24,        // 内容上下内边距

      colorBgElevated: 'var(--fill-fill-modal, #101112)', // 弹窗背景色
      colorText: 'var(--text-primary, #F5F5F5);', // 内容文字颜色
      colorIcon: 'var(--text-primary, #F5F5F5);', // 右上角关闭图标颜色

      // 遮罩
      // colorBgMask: 'rgba(0,0,0,0.75)',   // 遮罩层颜色

      // 页脚按钮相关（如果用默认 footer）
      footerBg: 'transparent'
    },
    Checkbox: {
      colorPrimaryBg: '#FFE566', // ✔ Checkbox 激活背景色
      colorPrimary: 'var(--text-brand-default-web, #ABE127)', // 勾选的勾颜色
      colorPrimaryHover: 'var(--text-brand-default-web, #ABE127)',
      colorPrimaryBorder: 'var(--line-border-default, #28292A)' // 边框颜色
    }
  }
};

/** Passkey 凭证已失效（不存在或已被删除）错误码 */
export const CODE_PASSKEY_CREDENTIAL_GONE = 14300011;
