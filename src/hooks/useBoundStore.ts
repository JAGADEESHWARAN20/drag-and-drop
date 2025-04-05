import { WebsiteState } from "@/types";
import { createContext, useContext } from "react";
import { StoreApi } from 'zustand';
import { useStore } from 'zustand';


// Create the context for the store
const StoreContext = createContext<StoreApi<WebsiteState> | undefined>(undefined);

// Custom hook to use the store within components
export const useBoundStore = <T>(selector: (state: WebsiteState) => T): T => {
     const store = useContext(StoreContext);
     if (!store) {
          throw new Error('useBoundStore must be used within a WebsiteStoreProvider.');
     }
     return useStore(store, selector);
};