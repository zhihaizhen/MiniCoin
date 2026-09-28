const gisLogout = () => {
  // 调用 GIS(Google Identity Services) 的 logout 方法
  window?.google.accounts.id.disableAutoSelect();
};

const gisInit = (clientId: string, callback: (response: any) => void) => {
  // 初始化 Google 身份服务
  if ('FederatedCredential' in window) {
    window?.google?.accounts.id.initialize({
      client_id: clientId,
      callback,
      auto_select: false // 不自动选中账户
    });
  }
};

const gisLogin = () => {
  // 使用 FedCM 进行 Google 登录
  window?.google?.accounts.id.prompt(); // 主动弹出 choose account 弹窗
};

const gapiInit = async (client_id: string) => {
  window.gapi.load('auth2', function () {
    window.gapi.auth2
      .init({
        client_id
      })
      .then(function (auth2) {
        // 检查是否已经登录
        if (auth2.isSignedIn.get()) {
          console.log('Already signed in');
        } else {
          console.log('Not signed in');
        }
      });
  });
};

const gapiLogin = async (locale?: string) => {
  console.log('User signed in:');
  const redirect_uri = window.location.origin + '/account/login/';
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline', // 可选：获取 refresh_token
    prompt: 'select_account' // 可选：每次都弹出账户选择
  });

  // 添加语言参数
  if (locale) {
    // Google OAuth支持的语言格式，如 en, zh-CN, zh-TW 等
    params.append('hl', locale);
  }

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

const gapiLogout = async () => {
  // 获取 gapi.auth2 实例
  const auth2 = window?.gapi.auth2.getAuthInstance();

  // 调用 signOut() 进行登出
  console.log('User signed out.');
  return await auth2.signOut();
};

export { gisInit, gisLogin, gisLogout, gapiInit, gapiLogin, gapiLogout };
