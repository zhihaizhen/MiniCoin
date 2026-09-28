import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface EarnDataContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const EarnDataContext = createContext<EarnDataContextType | undefined>(undefined);

export const EarnDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <EarnDataContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </EarnDataContext.Provider>
  );
};

export const useEarnDataRefresh = () => {
  const context = useContext(EarnDataContext);
  if (!context) {
    throw new Error('useEarnDataRefresh must be used within EarnDataProvider');
  }
  return context;
};
