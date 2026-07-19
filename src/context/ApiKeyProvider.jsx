import { useState } from 'react';
import { ApiKeyContext } from './apiKeyContext';

const STORAGE_KEY = 'sailserver-apikey';

export function ApiKeyProvider({ children }) {
  // sessionStorage: key survives a refresh but is wiped when the tab closes
  const [apikey, setApikey] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '');

  function setKey(key) {
    const trimmed = key.trim();
    if (!trimmed) return;
    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setApikey(trimmed);
  }

  function clearKey() {
    sessionStorage.removeItem(STORAGE_KEY);
    setApikey('');
  }

  const keySet = apikey !== '';

  return (
    <ApiKeyContext.Provider value={{ apikey, keySet, setKey, clearKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
}
