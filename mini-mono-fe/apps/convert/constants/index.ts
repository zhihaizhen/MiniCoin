
export const AntThemeConfig = {
  token: {
    colorPrimary: '#93C919', // --text-brand-default-web,
    colorTextBase: '#101112', // --text-primary,
    colorTextLightSolid: '#808588',
    colorBorder: 'var(--line-border-default, #EBEBEB)'
  },
  components: {
    Timeline: {
      dotBg: '#EBEBEB', // --text-brand-default-web,
      tailColor: '#EBEBEB' // --text-brand-default-web,
    },
    Input: {
      activeBg: 'var(--fill-fill-input, #F2F3F4)',
      hoverBg: 'var(--fill-fill-input, #F2F3F4)'
    },
    Select: {
      // controlHeight: 40, // Sets the height to 40px to match the h-10 class used in ProductList
      // borderRadius: 8 // Optional: adding border radius for better appearance
    }
  }
};
