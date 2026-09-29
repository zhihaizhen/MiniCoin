import React from 'react';
import { RulesProps } from '@better-bit-fe/base-ui';
import { FormattedMessage } from 'react-intl';

interface ItemProps {
  index?: number;
  title?: string;
  content?: string;
  className?: string;
  showOrder?: boolean;
  sum?: number;
}

const RuleItem: React.FC<ItemProps> = ({ index, title, content, className = '', showOrder = true }) => {
  return (
    <div className={`flex justify-start items-start text-sm md:text-base ${className}`}>
      {showOrder && (
        <span className="text-sm md:text-lg font-bold text-text-brand-default leading-[18px] md:leading-[26px]">
           {index}.
        </span>
      )}
      <div className={`flex-1 ${showOrder ? 'ml-2 md:ml-3' : ''}`}>
        {title && <span className="inline-block text-nowrap mr-1">{title}</span>}
        {content}
      </div>
    </div>
  );
};

const RuleSubItem: React.FC<ItemProps> = ({ content, className = '', showOrder = true, sum }) => {
  const hasHTag = (content: string) => {
    return /^<h[^>]*>/.test(content);
  };

  const shouldShowPoint = (content: string) => {
    return sum > 1 && !hasHTag(content);
  };

  return (
    <div className={`flex items-center text-xs md:text-base ${showOrder ? 'ml-8' : 'ml-1 md:ml-2'} ${className}`}>
      <div className={`flex items-center ${shouldShowPoint(content) ? "before:content-[''] before:inline-block before:w-1.5 before:h-1.5 before:bg-white before:rounded-full before:mr-3" : ''}`}>
        <span className="flex-1">
          <FormattedMessage
            id="none"
            defaultMessage={content||''}
            values={{
              h: (chunks) => chunks
            }}
          />
        </span>
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
const SimpleRules = ({ rules, titleClassName, contentClassName, showOrder = true }: IProps) => {
  return (
    <div className='mx-auto relative text-white flex flex-col justify-start items-start'>
        <div className='flex flex-col gap-4 md:gap-4'>
          {rules.map((rule, index) => (
            <React.Fragment key={rule.ruleOrder}>
              <RuleItem
                index={index + 1}
                content={rule.ruleTitle}
                className={titleClassName}
                showOrder={showOrder}
              />
              {rule.contents?.map((subItem) => (
                <RuleSubItem
                  key={subItem.contentOrder}
                  content={subItem.content}
                  className={contentClassName}
                  showOrder={showOrder}
                  sum={rule.contents.length}
                />
              ))}
            </React.Fragment>
          ))}

        </div>
      </div>

  );
};

export default SimpleRules;
