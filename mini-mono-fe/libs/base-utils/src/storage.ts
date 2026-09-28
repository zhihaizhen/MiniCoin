export const storage = {
  set(key, value) {
    if (window.localStorage) {
      if (value === undefined) {
        return localStorage.removeItem(key);
      }
      return localStorage.setItem(key, value);
    }
    return null;
  },
  setObject(key, value) {
    return this.set(key, JSON.stringify(value));
  },
  get(key) {
    if (window.localStorage) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        return null;
      }
    }
    return '';
  },
  getObject(key) {
    try {
      return JSON.parse(this.get(key));
    } catch (err) {
      return {};
    }
  },
  remove(key) {
    /* istanbul ignore next */
    if (window.localStorage) {
      localStorage.removeItem(key);
    }
  }
};
