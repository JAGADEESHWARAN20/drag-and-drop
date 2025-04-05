import { createContext } from 'react';
import { useWebsiteStore } from './WebsiteStore'; 
import { WebsiteStoreProviderProps } from '../types'; 


export const StoreContext = createContext(null);


export const WebsiteStoreProvider: React.FC<WebsiteStoreProviderProps> = ({ children }) => {
     return (
          <StoreContext.Provider value={useWebsiteStore} >
               {children}
          </StoreContext.Provider>
     );
};
