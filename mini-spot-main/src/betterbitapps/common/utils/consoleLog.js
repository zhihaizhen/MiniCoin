export const consoleLog = (...message) => {
  const isShow = localStorage.getItem('MESSAGE_STATUS');
  if (isShow) {
    console.log(...message);
  }
};
