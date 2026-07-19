import { createContext, useContext } from 'react';

export const ApiKeyContext = createContext(null);

export function useApiKey() {
  return useContext(ApiKeyContext);
}
