/**
 * 从剪贴板粘贴文本
 * @returns Promise<string> 返回剪贴板中的文本内容
 */
export const pasteFromClipboard = () => {
  return new Promise((resolve, reject) => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.clipboard !== 'undefined' &&
      typeof navigator.clipboard.readText === 'function'
    ) {
      navigator.clipboard
        .readText()
        .then((text) => {
          resolve(text);
        })
        .catch((error) => {
          console.error('Clipboard API 读取失败:', error);
          reject(error);
        });
    } else {
      // 这里提示用户手动粘贴
      reject(new Error('Please use Ctrl+V or ⌘+V'));
    }
  });
};
