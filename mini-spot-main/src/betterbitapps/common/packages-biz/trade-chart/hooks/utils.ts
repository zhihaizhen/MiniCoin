declare global {
  interface Document {
    webkitIsFullScreen: boolean | undefined;
    mozFullScreen: boolean | undefined;
    msFullscreenEnabled: boolean | undefined;
  }
  interface Window {
    fullScreen: boolean | undefined;
  }
}

function toFullScreen(dom: any) {
  if (dom.requestFullscreen) {
    return dom.requestFullscreen();
  }
  if (dom.webkitEnterFullScreen) {
    return dom.webkitEnterFullScreen();
  }
  if (dom.webkitRequestFullScreen) {
    return dom.webkitRequestFullScreen();
  }
  if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  }
  if (dom.msRequestFullscreen) {
    return dom.msRequestFullscreen();
  }
  return null;
}
function exitFullScreen() {
  const dom: any = window.document;
  if (dom.requestFullscreen) {
    return dom.requestFullscreen();
  }
  if (dom.webkitExitFullScreen) {
    return dom.webkitExitFullScreen();
  }
  if (dom.webkitRequestFullScreen) {
    return dom.webkitRequestFullScreen();
  }
  if (dom.webkitCancelFullScreen) {
    return dom.webkitCancelFullScreen();
  }
  if (dom.mozRequestFullScreen) {
    return dom.mozRequestFullScreen();
  }
  if (dom.msRequestFullscreen) {
    return dom.msRequestFullscreen();
  }
  return null;
}
function checkFull() {
  let isFull: boolean | undefined =
    document.fullscreenEnabled &&
    (window?.fullScreen ||
      document?.webkitIsFullScreen ||
      document?.msFullscreenEnabled);
  if (isFull === undefined) {
    isFull = false;
  }
  return isFull;
}

export { toFullScreen, exitFullScreen, checkFull };
