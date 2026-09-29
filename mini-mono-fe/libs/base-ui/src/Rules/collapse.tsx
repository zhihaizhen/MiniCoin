import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactComponent as PlusIcon } from './icon/plus.svg';
import { ReactComponent as MinusIcon } from './icon/minus.svg';
import { RulesProps } from '@better-bit-fe/base-ui';
import { FormattedMessage } from 'react-intl';

const styles = `
@keyframes doubleBounce {
  0%   { transform: translateY(-20px); }
  40%  { transform: translateY(10px); }
  65%  { transform: translateY(-5px); }
  85%  { transform: translateY(2px); }
  100% { transform: translateY(0); }
}
.double-bounce {
  animation: doubleBounce 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
`;

interface RulesItemProps {
  title: string;
  children: React.ReactNode;
  collapsed: boolean;
  onClick: () => void;
  bounceId: number;
  isBouncing: boolean;
  isFirst: boolean;
  isLast: boolean;
  titleClassName?: string;
}

const RulesItem = ({
  title,
  children,
  collapsed,
  onClick,
  bounceId,
  isBouncing,
  isFirst,
  isLast,
  titleClassName = '',
}: RulesItemProps) => {
  const [animating, setAnimating] = useState(false);
  const prevBounceId = useRef(bounceId);

  useEffect(() => {
    if (isBouncing && bounceId !== prevBounceId.current) {
      prevBounceId.current = bounceId;
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [bounceId, isBouncing]);

  return (
  <div
    className={[
      'group/parent w-full py-6 cursor-pointer border-line-divider-primary',
      !isFirst && 'border-t',
      isLast && 'border-b',
      animating && 'double-bounce',
    ].filter(Boolean).join(' ')}
    onClick={onClick}
  >
    <div className="w-full flex items-center justify-between">
      <span className={`grandchild flex-1 pr-2 text-base md:text-xl font-medium ${titleClassName}`}>
        {title}
      </span>
      <div className="grandchild w-6 h-6 rounded-md bg-fill-button-tertiary-default flex items-center justify-center">
        <div
          className={`w-3 text-text-primary transition-transform duration-200 ease-[cubic-bezier(0.5,2.2,0.4,1.2)] ${collapsed ? 'rotate-180' : 'rotate-0'}`}
        >
          {collapsed ? <MinusIcon /> : <PlusIcon />}
        </div>
      </div>
    </div>
    <div
      className={[
        'grid transition-all overflow-hidden duration-500 ease-in-out',
        collapsed
          ? 'grid-rows-[1fr] opacity-100 mt-3 translate-y-0'
          : 'grid-rows-[0fr] opacity-0 mt-0 -translate-y-2',
      ].join(' ')}
    >
      <div className="min-h-0">{children}</div>
    </div>
  </div>
  );
};

interface IProps {
  rules: RulesProps[];
  titleClassName?: string;
  contentClassName?: string;
  showOrder?: boolean;
}

export const CollapseRules = ({
  rules,
  titleClassName,
  contentClassName,
  showOrder = true,
}: IProps) => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [bounceCounter, setBounceCounter] = useState(0);
  const [lastToggledIndex, setLastToggledIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setLastToggledIndex(index);
    setBounceCounter(c => c + 1);
    setExpandedIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  }, []);

  return (
    <>
      <div className="relative text-text-primary w-full mx-auto flex flex-col">
        {rules.map((rule, index) => {
          const isExpanded = expandedIndices.includes(index);
          const isBouncing = lastToggledIndex !== null && index > lastToggledIndex;

          return (
            <RulesItem
              key={rule.ruleOrder + rule.ruleTitle}
              title={showOrder ? `${index + 1}. ${rule.ruleTitle}` : rule.ruleTitle}
              collapsed={isExpanded}
              onClick={() => handleToggle(index)}
              bounceId={bounceCounter}
              isBouncing={isBouncing}
              isFirst={index === 0}
              isLast={index === rules.length - 1}
              titleClassName={titleClassName}
            >
              <div className="text-base text-text-secondary font-normal">
                {rule.contents?.map(item => (
                  <p key={item.contentOrder} className={contentClassName}>
                    <FormattedMessage
                      id="none"
                      defaultMessage={item?.content ?? ''}
                      values={{ h: chunks => chunks }}
                    />
                  </p>
                ))}
              </div>
            </RulesItem>
          );
        })}
      </div>
      <style>{styles}</style>
    </>
  );
};
