import { useState } from 'react';

import { createContainer } from 'unstated-next';

interface LocalesProps {
  locales: string[];
}
// 用于动态变更语言栏
function useLocales(initialStates: LocalesProps) {
  const [locales, changeLocales] = useState<string[]>(initialStates.locales);
  return {
    locales,
    changeLocales
  };
}
export const LocalesInfo = createContainer(useLocales);

export const LocalesProvider = LocalesInfo.Provider;
