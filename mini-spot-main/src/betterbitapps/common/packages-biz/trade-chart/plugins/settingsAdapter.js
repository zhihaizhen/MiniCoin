export class SettingsAdapter {
  constructor(storyKey, theme) {
    const normalizedTheme = theme ? theme.replace(/^theme-/, '') : '';
    this.storeScope = `${storyKey}${normalizedTheme ? `_${normalizedTheme}` : ''}`;
    const keys = localStorage.getItem(`${this.storeScope}.KEYS`);
    this.customKeys = new Set(keys ? JSON.parse(keys) : []);
    localStorage.removeItem('tradingview.chartproperties');
    localStorage.removeItem('tradingview.chartproperties.mainSeriesProperties');
  }

  getInitialSettings(config = { escapeKeys: [] }) {
    const { escapeKeys } = config;
    const initialSettings = {};
    if (this.customKeys.size) {
      this.customKeys.forEach((key) => {
        if (!escapeKeys.length || !escapeKeys.includes(key)) {
          initialSettings[key] = localStorage.getItem(
            `${this.storeScope}.${key}`,
          );
        }
      });
    }
    return initialSettings;
  }

  setValue(key, value) {
    this.customKeys.add(key);
    localStorage.setItem(`${this.storeScope}.${key}`, value);
    localStorage.setItem(
      `${this.storeScope}.KEYS`,
      JSON.stringify([...this.customKeys]),
    );
  }

  removeValue(key) {
    if (this.customKeys.delete(key)) {
      localStorage.setItem(
        `${this.storeScope}.KEYS`,
        JSON.stringify([...this.customKeys]),
      );
      localStorage.removeItem(`${this.storeScope}.${key}`);
    }
  }

  hasKey(key) {
    return this.customKeys.has(key);
  }

  hasCustomSetting() {
    return !!this.customKeys.size;
  }

  getCustomChartProperties() {
    let chartProperties = {};
    if (this.hasCustomSetting()) {
      chartProperties = localStorage.getItem(
        `${this.storeScope}.chartproperties`,
      );
    }
    return chartProperties;
  }

  getSettingByKey(key) {
    if (this.hasKey(key)) {
      return localStorage.getItem(`${this.storeScope}.${key}`);
    }
    return null;
  }

  clearKeys() {
    if (this.customKeys.size) {
      this.customKeys.forEach((key) => {
        localStorage.removeItem(`${this.storeScope}.${key}`);
      });
      this.customKeys.clear();
      localStorage.setItem(`${this.storeScope}.KEYS`, JSON.stringify([]));
    }
  }
}

// defaultsButtonItem-3eSfgMfv item-2xPVYue0
