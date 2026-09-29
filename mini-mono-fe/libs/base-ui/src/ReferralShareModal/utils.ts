const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const getRandomId = () => {
  let result = '';
  for (let i = 0; i < 34; i += 1) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
};
