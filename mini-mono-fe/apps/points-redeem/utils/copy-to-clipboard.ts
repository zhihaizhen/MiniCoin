// @ts-nocheck
export const copyToClipboard = (textToCopy) => {
  if (navigator.clipboard) {
    // clipboard api 复制
    navigator.clipboard.writeText(textToCopy);
  } else {
    // text area method
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.clip = 'rect(0 0 0 0)';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);

    textArea.select();
    return new Promise((res, rej) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      document?.execCommand?.('copy') ? res() : rej();
      // textArea.remove();
      document.body.removeChild(textArea);
    });
  }
};
