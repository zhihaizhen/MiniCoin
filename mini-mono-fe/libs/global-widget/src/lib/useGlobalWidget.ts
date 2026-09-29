// @ts-nocheck
import { useDexHeader, useDexFooter } from 'betterbit-frame-pkg';
import load from 'load-script';
interface IUseGlobalWidget {
  componentHeader: Promise<any>;
  componentFooter: Promise<any> | null;
}

export interface GlobalWidgetConfig {
  isDex?: boolean;
  type?: 'small' | 'large' | 'none';
  headerElementId?: string;
  footerElementId?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
  position?: '' | 'middle';
  footerProps?: Record<string, unknown>;
}

let initialized = false;

function genPromise() {
  let returnResolve = null;
  const promise = new Promise((resolve) => {
    returnResolve = resolve;
  });
  return [promise, returnResolve];
}

const [componentHeader, resolveComponentHeader] = genPromise();

const [componentFooter, resolveComponentFooter] = genPromise();

const initGlobalWidget: (
  config?: GlobalWidgetConfig
) => IUseGlobalWidget = (config = {}) => {
  if (typeof window !== 'undefined' && !initialized) {
    initialized = true;
    const {
      isDex = true,
      type = 'large',
      headerElementId = 'widget_header',
      footerElementId = 'widget_footer',
      hideFooter = false,
      hideHeader = false,
      position = '',
      footerProps = {}
    } = config;

    const { createDexHeader } = useDexHeader();
    createDexHeader({
      elementId: headerElementId,
      props: { type, position }
    }).then(resolveComponentHeader);

    const { createDexFooter } = useDexFooter();

    createDexFooter({
      elementId: footerElementId,
      props: { type, ...footerProps }
    }).then(resolveComponentFooter);
    if (hideHeader) {
      if (typeof window !== 'undefined') {
        const currentHeader = document.getElementById(headerElementId);
        if (currentHeader) {
          currentHeader.style.display = 'none';
        }
      }
    }
    if (hideFooter) {
      if (typeof window !== 'undefined') {
        const currentFooter = document.getElementById(footerElementId);
        if (currentFooter) {
          currentFooter.style.display = 'none';
        }
      }
    }
  }
  return {
    componentHeader,
    componentFooter
  };
};

const fetchUserInfo = async () => {
  const { getDexHeader } = useDexHeader();
  const { getUserInfo } = await getDexHeader();
  return await getUserInfo();
};

const getUser = async () => {
  const { getDexHeader } = useDexHeader();
  const header = await getDexHeader();
  return new Promise((resolve, reject) => {
    header.onUserChange(async (_, originalUser) => {
      if (originalUser) {
        resolve(originalUser);
      } else {
        resolve(null);
      }
    });
  });
};

const getUserInfoFromHead = async (callback: any) => {
  const user = await getUser();
  if (user) {
    callback(user);
  } else {
    try {
      const userInfo = await fetchUserInfo();
      callback(userInfo.originData);
    } catch (err) {
      callback(false);
    }
  }
  /*
  const { getDexHeader } = useDexHeader();
  const header = await getDexHeader();
  console.log(888, header);
  header.onUserChange(async (_, originalUser) => {
    console.log(890, _, originalUser);
    if (originalUser) {
      // callback(originalUser);
    } else {
      // const userInfo = await fetchUserInfo();
      // if (userInfo.originData) {
      //   callback(userInfo.originData);
      // } else {
      //   callback(null);
      // }
    }
  });
  */
  // const userInfo = await fetchUserInfo();
  // callback(userInfo.originData);
};

const showConnectDialog = async (params?: any) => {
  const { getDexHeader } = useDexHeader();
  const { showConnectDialog } = await getDexHeader();
  showConnectDialog(params);
};

const gotoLoginPage = async () => {
  const { getDexHeader } = useDexHeader();
  const { goLoginPage } = await getDexHeader();
  goLoginPage();
};

export {
  initGlobalWidget,
  getUserInfoFromHead,
  showConnectDialog,
  gotoLoginPage,
  fetchUserInfo
};
