
import React, { createContext, useContext, ReactNode } from 'react';
import { useWebsiteStore } from './WebsiteStore';

interface WebsiteStoreContextProps {
  children: ReactNode;
}

const WebsiteStoreContext = createContext({});

export const WebsiteStoreProvider: React.FC<WebsiteStoreContextProps> = ({ children }) => {
  return (
    <WebsiteStoreContext.Provider value={useWebsiteStore}>
      {children}
    </WebsiteStoreContext.Provider>
  );
};

export const useWebsiteStoreContext = () => {
  const context = useContext(WebsiteStoreContext);
  if (context === undefined) {
    throw new Error('useWebsiteStoreContext must be used within a WebsiteStoreProvider');
  }
  return context;
};
