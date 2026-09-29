
export const AntThemeConfig = {
  token: {
    colorPrimary: '#93C919', // --text-brand-default-web,
    colorTextBase: '#101112', // --text-primary,
    colorTextLightSolid: '#808588',
    colorBorder: 'var(--line-border-default, #EBEBEB)'
  },
  components: {
    Modal: {
      contentBg: 'var(--fill-fill-modal, #101112)'
    },
    Pagination: {
      itemActiveColor: 'var(--text-black, #101112)',
      itemActiveColorHover: 'var(--text-black, #101112)',
      itemActiveBg: 'var(--fill-fill-primary, #93C919)',
    }
  }
};
