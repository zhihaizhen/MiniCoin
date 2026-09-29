// @ts-nocheck
import { isApp } from './browser';

export const downloadFile = (link: string, name = '') => {
  try {
    if (isApp()) {
      window?.Hecate?.UrlLauncher?.open({ url: link });
    } else {
      const anchor = document.createElement('a');
      anchor.download = name;
      anchor.href = link;
      anchor.click();
    }
  } catch (error) {
    console.error('download file error:', error);
  }
};

export const downloadImageBase64 = (dataUrl: string) => {
  try {
    if (isApp()) {
      // replace the base64 string prefix,such as 'data:image/png;base64,'
      // or it will failed on calling app shareImage jsBridge
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      window?.Hecate?.Share?.shareImage({ data: base64 });
    } else {
      const link = document.createElement('a');
      link.download = 'share.jpeg';
      link.href = dataUrl;
      link.click();
    }
  } catch (error) {
    console.error('download image error:', error);
  }
};

// @ts-nocheck
export const downloadBlob = (blob, fileName = '') => {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = fileName;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  );

  // Remove link from body
  document.body.removeChild(link);
};
