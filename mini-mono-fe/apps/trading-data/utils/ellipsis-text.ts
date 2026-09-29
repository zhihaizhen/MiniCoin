export const ellipsisFormatter = (text, prefix = 12, suffix = 6) => {
  if (!text) {
    return '';
  }
  if (text.length < prefix + suffix) return text;
  return text.substring(0, prefix) + '...' + text.substr(-1 * suffix);
};
