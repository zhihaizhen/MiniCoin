/**
 * A recursive function to replace the translation value with i18n key
 * @param key
 * @param value
 * @param path: the associated key path (from root to current layer)
 * @param translationObj: this object will be used for Weblate unit creation
 * @return the i18n key or the nested object
 */
module.exports = function compileI18nKey(key, value, path, translationObj){
  if (typeof value !== 'object') {
    translationObj[path] = value;
    return `$:${path}`;
  } else {
    const result = {};
    Object.entries(value).map(([k, v]) => {
      const newPath = path ? `${path}${k.charAt(0).toUpperCase()}${k.slice(1)}` : k;
      result[k] = compileI18nKey(k, v, newPath, translationObj);
    });
    return result;
  }
};
