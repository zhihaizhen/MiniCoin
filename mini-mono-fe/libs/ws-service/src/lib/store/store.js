const store = {
  isReady: false,
  dispatch: () => {
    // eslint-disable-next-line no-console
    console.error('store is NOT ready');
  },
};

export default store;
