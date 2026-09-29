// @ts-nocheck
import React from 'react';
import { FormattedMessage } from 'react-intl';
export const LangFormatMsg = (props) => {
  return (
    <>
      <FormattedMessage data-lang-tooltip={props.id} {...props} />
      <div data-lang-tooltip={props.id} />
    </>
  );
};

type TypeName = 'text' | 'html';
type ObjectType<T> = T extends 'text'
  ? string
  : T extends 'html'
  ? React.ReactNode
  : never;

export type ILangeFormatMsg = <T extends TypeName>(
  id: string,
  values?: unknown,
  type?: T
) => ObjectType<T>;

export const langFormatMsg = (formatMessage) => {
  return function <T extends TypeName>(
    id: string,
    values?: unknown,
    type?: T
  ): ObjectType<T> {
    if (type === 'text') {
      return `${formatMessage({ id }, values)}` as ObjectType<T>;
    }
    return (<>{formatMessage({ id }, values)}</>) as ObjectType<T>;
  };
};
