export function fontAdaptation() {
  const docEl = document.documentElement;
  docEl.style.fontSize = `${docEl.clientWidth / 7.5}px`;
}

window.addEventListener('resize', fontAdaptation, false);

export default fontAdaptation;
