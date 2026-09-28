import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { setTheme, getTheme } from '@better-bit-fe/base-utils';

// 定义 Context 类型
interface ThemeContextType {
    theme: string | null; // 初始可能为 null
    // 如果需要，可以添加切换主题的函数
    // toggleTheme: () => void;
}

// 创建 Context，提供默认值
const ThemeContext = createContext<ThemeContextType>({
    theme: null,
    // toggleTheme: () => {},
});

// 创建 Provider 组件
interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setCurrentTheme] = useState<string | null>(null);

    useEffect(() => {
        // 1. 初始化时设置主题（例如，在 <html> 上设置 class）
        setTheme();
        // 2. 获取初始主题并设置 React state
        const initialTheme = getTheme();
        setCurrentTheme(initialTheme);
        console.log('ThemeProvider: Initial theme set to', initialTheme);

        // 3. 监听主题变化（通过观察 <html> 的 class 属性）
        const observer = new MutationObserver(() => {
            // 当 class 变化时，重新获取主题并更新 React state
            const newTheme = getTheme();
            console.log('ThemeProvider: Theme changed, new theme:', newTheme);
            setCurrentTheme(newTheme);
        });

        // 确保 document.documentElement 存在 (客户端渲染)
        if (typeof window !== 'undefined' && document.documentElement) {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class'] // 只观察 class 属性
            });
        }

        // 4. 清理监听器
        return () => {
            observer.disconnect();
            console.log('ThemeProvider: Observer disconnected');
        };
    }, []); // 空依赖数组确保只在挂载和卸载时运行

    // 将 theme 状态通过 Provider 传递下去
    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 创建一个自定义 Hook 以方便使用 Context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    // 可以在这里处理 theme 为 null 的情况
    // if (context.theme === null) {
    //   // 返回默认值或抛出错误，或返回 null
    // }
    return context;
}; 