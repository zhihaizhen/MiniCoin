// Apple ID 登录工具函数

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleIDConfig) => void;
        signIn: () => Promise<AppleIDSignInResponse>;
        signOut: () => Promise<void>;
      };
    };
  }
}

interface AppleIDConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state?: string;
  usePopup?: boolean;
}

interface AppleIDSignInResponse {
  authorization: {
    code: string;
    id_token: string;
    state?: string;
  };
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

// 初始化 Apple ID 登录
const appleInit = (clientId: string, redirectURI: string) => {
  if (typeof window !== 'undefined' && window.AppleID) {
    window.AppleID.auth.init({
      clientId,
      scope: 'name email',
      redirectURI,
      usePopup: true // 使用弹窗模式
    });
  }
};

// Apple ID 登录
const appleLogin = async (): Promise<AppleIDSignInResponse> => {
  if (typeof window !== 'undefined' && window.AppleID) {
    try {
      const response = await window.AppleID.auth.signIn();
      return response;
    } catch (error: any) {
      // 检查是否是用户取消操作
      if (
        error?.error === 'popup_closed_by_user' ||
        error?.error === 'user_cancelled_authorize' ||
        error?.error === 'popup_closed' ||
        (typeof error === 'string' && error.includes('popup_closed'))
      ) {
        // 用户主动取消，不输出错误日志，创建一个特殊的错误类型
        const cancelError = new Error('User cancelled Apple login');
        (cancelError as any).userCancelled = true;
        throw cancelError;
      }

      // 只有非用户取消的错误才输出到控制台
      console.error('Apple login failed:', error);
      throw error;
    }
  } else {
    throw new Error('Apple ID SDK not loaded');
  }
};

// Apple ID 登出
const appleLogout = async (): Promise<void> => {
  if (typeof window !== 'undefined' && window.AppleID) {
    try {
      await window.AppleID.auth.signOut();
    } catch (error) {
      console.error('Apple logout failed:', error);
      throw error;
    }
  }
};

// 使用重定向方式的 Apple 登录（备用方案）
const appleLoginRedirect = (locale?: string) => {
  const clientId =
    process.env.APPLE_CLIENT_ID || process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  const redirectURI =
    (process.env.NEXT_PUBLIC_APPLE_REDIRECT_URL as string) ||
    `https://${window.location.hostname}/account/login/`;
  const state = Math.random().toString(36).substring(2, 15);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectURI,
    response_type: 'code id_token',
    scope: 'name email',
    response_mode: 'form_post',
    state
  });

  // 添加语言参数
  if (locale) {
    const appleLocale = locale.replace('-', '_'); // Apple使用下划线格式
    params.append('locale', appleLocale);
  }

  // 保存 state 用于验证
  sessionStorage.setItem('apple_login_state', state);

  window.location.href = `https://appleid.apple.com/auth/authorize?${params}`;
};

export { appleInit, appleLogin, appleLogout, appleLoginRedirect };
