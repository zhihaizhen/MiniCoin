export const SOCIAL_SHARE_URL = {
  twitter: 'https://twitter.com/intent/tweet',
  telegram: 'https://t.me/share/url',
  medium: 'https://medium.com/@easicoin402',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
  discord: 'https://discord.gg/kfSyjuw9',
  instagram: 'https://www.instagram.com/easi_coin/'
};

export const popupNewWindow = (url) => {
  const w = 800;
  const h = 600;
  const scroll = 'yes';
  const { width, height } = window.screen;
  const leftPosition = width ? (width - w) / 2 : 0;
  const topPosition = height ? (height - h) / 2 : 0;
  const settings = `height=${h},width=${w},top=${topPosition},left=${leftPosition},scrollbars=${scroll},resizable`;
  window.open(url, '', settings);
};

export const getRandomId = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 34; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};
