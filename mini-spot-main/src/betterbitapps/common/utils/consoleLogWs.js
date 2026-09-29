export const consoleLogWs = (...message) => {
  const isShow = localStorage.getItem('WS_LOG_STATUS');
  if (isShow) {
    console.log(...message);
  }
};
