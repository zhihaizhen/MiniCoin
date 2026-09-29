import { useDexFooter, useDexHeader, useIPLimited } from 'betterbit-frame-pkg';
import { isDex } from 'common/utils/env';

async function useGlobalWidget({
  handleLangChange,
  handleThemeChange,
  handleLogout,
  returnPageUrl,
}) {
  const { createDexHeader } = useDexHeader();
  const { createIPLimited } = useIPLimited();
  initIpLimit(createIPLimited);
 
  const header = await createDexHeader({
    elementId: 'widget_header',
  });
  const { onLanguageChange, onThemeChange, onLogout, setReturnPage } = header;
  onLanguageChange(handleLangChange);
  
  onThemeChange(handleThemeChange);
  console.log('handleThemeChange2222', onThemeChange);
  onLogout(() => {
    handleLogout();
    window.location.reload();
  });
  setReturnPage(returnPageUrl);
}

function initIpLimit(createIPLimited) {
  // const ipLimimt = document.createElement('div');
  // ipLimimt.id = 'ip_limit__';
  // const header = document.getElementById('widget_header');
  // header.parentNode.insertBefore(ipLimimt, header);
  // createIPLimited({ elementId: '__ip_limit__' });
}

export async function getUserInfo(callback) {
  const { getDexHeader } = useDexHeader();
  const header = await getDexHeader();

  header.onUserChange((_, originalUser) => {
    if (originalUser) {
      callback(originalUser);
    }
  });
}

export async function showConnectDialog() {
  const { getDexHeader } = useDexHeader();
  const { showConnectDialog } = await getDexHeader();
  showConnectDialog();
}

export default useGlobalWidget;
