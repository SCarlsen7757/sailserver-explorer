import { createContext, useContext } from 'react';

export const DataCacheContext = createContext(null);

export function useDataCache() {
  return useContext(DataCacheContext);
}
