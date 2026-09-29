import React from 'react';
import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd';

const DEFAULT_TITLE_CLASS_NAME =
  'text-white flex flex-col justify-start items-center';
const DEFAULT_TRIGGER_CLASS_NAME =
  'cursor-pointer underline decoration-dashed decoration-gray-300 underline-offset-4';

const joinClassNames = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(' ');

interface EarnTooltipProps extends Omit<TooltipProps, 'title' | 'children'> {
  title: React.ReactNode;
  children: React.ReactNode;
  titleClassName?: string;
  triggerClassName?: string;
}

const EarnTooltip: React.FC<EarnTooltipProps> = ({
  title,
  children,
  titleClassName = DEFAULT_TITLE_CLASS_NAME,
  triggerClassName,
  placement = 'top',
  ...props
}) => {
  const triggerClassNames = joinClassNames(
    DEFAULT_TRIGGER_CLASS_NAME,
    triggerClassName,
  );

  const trigger = React.isValidElement(children) ? (
    React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: joinClassNames(children.props.className, triggerClassNames),
    })
  ) : (
    <span className={triggerClassNames}>{children}</span>
  );

  return (
    <Tooltip
      placement={placement}
      title={<div className={titleClassName}>{title}</div>}
      {...props}
    >
      {trigger}
    </Tooltip>
  );
};

export default EarnTooltip;
