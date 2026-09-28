export const setTheme = () => {
  if (getTheme()) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const getTheme = () => {
  const DarkModeTheme = localStorage.getItem('DarkModeTheme');
  const isDarkTheme = ['dark', 'light'].includes(DarkModeTheme)
    ? DarkModeTheme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDarkTheme ?  'dark' : 'light';
};


export const addCandleThemeData = (themeData?: string) => {
  document.documentElement.classList.add(themeData || localStorage.getItem('TRADE_COLOR_PREFERENCE'));
}
