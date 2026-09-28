import React, { useContext, useEffect, useRef } from 'react';

import { LayoutContainerProps } from './container';

interface Props extends LayoutContainerProps {
  locales: string[];
}

export function Body({ locale, locales, children }: Props) {
  return <>{children}</>;
}
