// @ts-nocheck
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { trade_color_lang_map } from '@better-bit-fe/base-utils';
import { useRouter } from 'next/router';

interface IContext {
  colorPreference: string;
}
// 创造context
const ColorPreferenceContext = createContext<IContext>({
  colorPreference: ""
});


const ColorPreferenceProvider = ({ children }) => {
  const [colorPreference, setColorPreference] = useState('');
  const { locale } = useRouter();

  useEffect(() => {
    const v = localStorage.getItem('TRADE_COLOR_PREFERENCE');
    const defaultColor = trade_color_lang_map[locale] || trade_color_lang_map.default;
    console.log('colorPreference-context', v, defaultColor)
    // if (!v) {
    //   localStorage.setItem('TRADE_COLOR_PREFERENCE', defaultColor);
    // }
    const cp = v || defaultColor;
    setColorPreference(cp);
  }, []);

  return (
    <ColorPreferenceContext.Provider
      value={{
        colorPreference
      }}
    >
      {children}
    </ColorPreferenceContext.Provider>
  );
};

// 创建hook
const useColorPreference = () => {
  return useContext(ColorPreferenceContext);
};

export { ColorPreferenceContext, ColorPreferenceProvider, useColorPreference };
