// @ts-nocheck
// export const copyToClipboard = (textToCopy) => {
//   console.log(999889, navigator);
//   if (navigator.clipboard) {
//     // clipboard api 复制
//     navigator.clipboard.writeText(textToCopy);
//   } else {
//     // text area method
//     const textArea = document.createElement('textarea');
//     textArea.value = textToCopy;
//     textArea.style.position = 'fixed';
//     textArea.style.clip = 'rect(0 0 0 0)';
//     textArea.style.left = '-999999px';
//     textArea.style.top = '-999999px';
//     document.body.appendChild(textArea);

//     textArea.select();
//     return new Promise((res, rej) => {
//       // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//       document?.execCommand?.('copy') ? res() : rej();
//       // textArea.remove();
//       document.body.removeChild(textArea);
//     });
//   }
// };

export const copyToClipboard = (text) => {
  console.log(999, '点击了复制');
  return new Promise((resolve, reject) => {
    console.log(
      9991,
      typeof navigator !== 'undefined' &&
        typeof navigator.clipboard !== 'undefined' &&
        navigator.permissions !== 'undefined'
    );
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.clipboard !== 'undefined' &&
      navigator.permissions !== 'undefined'
    ) {
      const type = 'text/plain';
      const blob = new Blob([text], { type });
      const data = [new ClipboardItem({ [type]: blob })];
      navigator.permissions
        .query({ name: 'clipboard-write' })
        .then((permission) => {
          if (permission.state === 'granted' || permission.state === 'prompt') {
            navigator.clipboard.write(data).then(resolve, reject).catch(reject);
          } else {
            reject(new Error('Permission not granted!'));
          }
        });
    } else {
      const textarea = document.createElement('textarea');
      textarea.textContent = text;
      textarea.style.position = 'fixed';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = 0;
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        resolve();
      } catch (e) {
        document.body.removeChild(textarea);
        reject(e);
      }
    }
  });
};
