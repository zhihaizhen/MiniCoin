/*判断类型*/
export const checkType = () => {
  if (
    navigator &&
    navigator.userAgent &&
    /Mobi|Android|iPhone/i.test(navigator.userAgent)
  ) {
    if (
      navigator &&
      navigator.userAgent &&
      /(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)
    ) {
      return 'ios';
    } else {
      return 'android';
    }
  } else {
    return 'pc';
  }
};
