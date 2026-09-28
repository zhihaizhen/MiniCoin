const getSelector = (element) => {
  let selector;
  if (element.id) {
    selector = `#${element.id}`;
  } else if (element.className && typeof element.className === 'string') {
    selector = `.${element.className}`
      .split(' ')
      .filter(function (item) {
        return !!item;
      })
      .join('.');
  } else {
    selector = element.nodeName.toLowerCase();
  }
  return selector;
};

export { getSelector };
