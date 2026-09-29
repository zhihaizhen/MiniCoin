export const preloadImage = (src: string) => {
  try {
    const img = document.createElement('img');
    img.src = src;
    img.hidden = true;
    img.onload = () => {
      document.body.removeChild(img);
    };
    document.body.appendChild(img);
  } catch (error) {
    console.error('preload image error', error);
  }
};

export const preloadFetchSupported = () => {
  const link = document.createElement('link');
  link.as = 'fetch';
  return link.as === 'fetch';
};

export const preloadVideo = (src: string) => {
  return new Promise((resolve, reject) => {
    try {
      const link = document.createElement('link');
      link.id = 'preloadVideo';
      link.as = 'fetch';
      link.rel = 'preload';
      link.hidden = true;
      link.href = src;
      link.onload = () => {
        document.body.removeChild(link);
        resolve(true);
      };
      document.body.appendChild(link);
    } catch (error) {
      console.error('preload link error', error);
      reject(false);
    }
  });
};
