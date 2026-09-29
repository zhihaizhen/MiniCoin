import React, { useState, useRef, useEffect, useCallback, useMemo, ReactNode } from 'react';
import cls from 'classnames';

/**
 * MuTabs — native tabs component (no antd dependency)
 *
 * Props (compatible with antd Tabs):
 *  - activeKey        controlled active key
 *  - defaultActiveKey default active key (uncontrolled)
 *  - onChange(key)    callback when active tab changes
 *  - items            array of { key, label, children, disabled }
 *  - tabs             alias for items
 *  - children         <MuTabs.TabPane> nodes (legacy usage)
 *  - className        extra class on the nav bar
 *  - wrapperCls       extra class on the outer wrapper
 */

const INDICATOR_WIDTH = 16;

export interface MuTabItem {
  key?: string | number;
  value?: string | number;
  label?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}

interface NormalizedMuTabItem extends MuTabItem {
  key: string | number;
  renderKey: string;
}

export interface MuTabsProps {
  className?: string;
  wrapperCls?: string;
  items?: MuTabItem[];
  tabs?: MuTabItem[];
  children?: ReactNode;
  activeKey?: string | number;
  defaultActiveKey?: string | number;
  onChange?: (key: string | number) => void;
  size?: 'small' | 'default';
}

interface MuTabsComponent extends React.FC<MuTabsProps> {
  TabPane: React.FC<{ children?: ReactNode }>;
}

const MuTabs: MuTabsComponent = (props) => {
  const {
    className,
    wrapperCls,
    items,
    tabs,
    children,
    activeKey: controlledKey,
    defaultActiveKey,
    onChange,
    size
  } = props || {};

  const tabItems = useMemo(
    () => normalizeTabItems(items || tabs || childrenToItems(children)),
    [children, items, tabs]
  );
  const isControlled = controlledKey !== undefined;

  const [internalKey, setInternalKey] = useState<string | number>(() => {
    if (defaultActiveKey !== undefined) return defaultActiveKey;
    return tabItems?.[0]?.key ?? '';
  });

  const activeKey = isControlled ? controlledKey : internalKey;

  useEffect(() => {
    if (isControlled) setInternalKey(controlledKey as string | number);
  }, [isControlled, controlledKey]);

  // Sliding indicator
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, opacity: 0 });

  const updateIndicator = useCallback(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.querySelector<HTMLElement>(`[data-active="true"]`);
    if (!activeEl) return;
    const navRect = navRef.current.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    const center = tabRect.left - navRect.left + tabRect.width / 2;
    setIndicator({ left: center - INDICATOR_WIDTH / 2, opacity: 1 });
  }, []);

  useEffect(() => {
    // Use rAF so the DOM has settled after key change
    const id = requestAnimationFrame(updateIndicator);
    return () => cancelAnimationFrame(id);
  }, [activeKey, updateIndicator]);

  // Re-calculate on resize
  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const handleTabClick = (key: string | number, disabled?: boolean) => {
    if (disabled) return;
    if (!isControlled) setInternalKey(key);
    onChange?.(key);
  };

  const activeItem = tabItems?.find((t) => t.key === activeKey);

  return (
    <div className={cls('flex flex-col', wrapperCls)}>
      {/* Tab nav bar */}
      <div
        className={cls('relative flex flex-row items-center flex-shrink-0 gap-6 mb-6', className)}
        ref={navRef}
      >
        {tabItems?.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.renderKey}
              type="button"
              data-active={isActive ? 'true' : 'false'}
              disabled={item.disabled}
              className={cls(
                'appearance-none border-0 bg-transparent cursor-pointer p-0 m-0 outline-none font-medium text-base leading-6 pb-2 whitespace-nowrap select-none transition-colors duration-200 hover:enabled:text-[var(--text-primary,#101112)] disabled:cursor-not-allowed disabled:opacity-40',
                isActive
                  ? 'text-[var(--text-primary,#101112)]'
                  : 'text-[var(--text-secondary,#81858c)]',
                { 'text-sm leading-[18px]': size === 'small' }
              )}
              onClick={() => handleTabClick(item.key, item.disabled)}
            >
              {item.label}
            </button>
          );
        })}

        {/* Animated underline indicator */}
        <span
          className="absolute bottom-0 h-[3px] rounded-sm bg-[var(--text-primary,#101112)] pointer-events-none transition-[left,width] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            left: indicator.left,
            width: INDICATOR_WIDTH,
            opacity: indicator.opacity,
          }}
        />
      </div>

      {/* Active tab content */}
      {activeItem && <div className="flex-1">{activeItem.children}</div>}
    </div>
  );
};

/** Convert <TabPane> children to items array (legacy support) */
function childrenToItems(children: ReactNode): MuTabItem[] {
  if (!children) return [];
  return React.Children.toArray(children)
    .filter((child): child is React.ReactElement => React.isValidElement(child))
    .map((child) => ({
      key: String(child.key ?? child.props?.tabKey ?? ''),
      label: child.props?.tab,
      children: child.props?.children,
      disabled: child.props?.disabled,
    }));
}

function normalizeTabItems(tabItems?: MuTabItem[]): NormalizedMuTabItem[] {
  if (!Array.isArray(tabItems)) return [];

  const seenRenderKeys = new Map<string, number>();

  return tabItems.filter(Boolean).map((item, index) => {
    const key = item.key ?? item.value ?? index;
    const baseRenderKey = String(key || `tab-${index}`);
    const duplicateCount = seenRenderKeys.get(baseRenderKey) || 0;

    seenRenderKeys.set(baseRenderKey, duplicateCount + 1);

    return {
      ...item,
      key,
      renderKey: duplicateCount === 0 ? baseRenderKey : `${baseRenderKey}-${index}`,
    };
  });
}

/** Legacy TabPane sub-component */
MuTabs.TabPane = function TabPane({ children }) {
  return <>{children}</>;
};

export default MuTabs;
