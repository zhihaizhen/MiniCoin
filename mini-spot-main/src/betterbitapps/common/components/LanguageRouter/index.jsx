import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLang } from 'common/utils/storageData';
import { languageSelections } from 'common/constants/selections';

const LanguageRouter = ({ children }) => {
  const { i18n } = useTranslation();
  const currentLang = getLang();
  
  // 创建支持的语言列表
  const supportedLanguages = languageSelections.map(item => item.value);
  
  useEffect(() => {
    // 确保仅在浏览器环境中执行
    if (typeof window === 'undefined') return;
    
    // 使用浏览器的window.location替代Router的location
    const { pathname } = window.location;
    
    // 检查URL是否已经包含语言前缀
    const hasLangPrefix = /^\/[a-z]{2}(-[A-Z]{2})?(\/|$)/.test(pathname);
    
    if (!hasLangPrefix) {
      // 如果没有语言前缀，重定向到带语言前缀的URL
      const newPath = `/${currentLang}${pathname}`;
      window.location.replace(newPath);
      return;
    }
    
    // 如果URL有语言前缀，检查是否需要切换语言
    const urlLang = pathname.split('/')[1];
    
    // 验证提取的语言代码是否有效并且在支持的语言列表中
    const isValidLang = /^[a-z]{2}(-[A-Z]{2})?$/.test(urlLang) && supportedLanguages.includes(urlLang);
    
    if (!isValidLang) {
      // 如果语言代码不在支持列表中，重定向到当前语言
      const pathWithoutLang = pathname.substring(urlLang.length + 1) || '/';
      const newPath = `/${currentLang}${pathWithoutLang}`;
      window.location.replace(newPath);
      return;
    }
    
    if (urlLang !== currentLang) {
      // 切换语言前记录当前的滚动位置
      const scrollPos = window.scrollY;
      
      i18n.changeLanguage(urlLang, () => {
        // 语言切换后恢复滚动位置，避免页面跳动
        window.scrollTo(0, scrollPos);
      });
    }
  }, [currentLang, i18n, window.location.pathname, supportedLanguages]); // 添加依赖项
  
  return <>{children}</>;
};

export default LanguageRouter; 