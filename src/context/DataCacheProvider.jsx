import { useState } from 'react';
import { DataCacheContext } from './dataCacheContext';

// In-memory cache of fetched API results so panel data survives navigation.
// Remounted (and thus emptied) when the API key changes — see App.jsx.
export function DataCacheProvider({ children }) {
  const [cache, setCache] = useState({});

  function setCached(key, value) {
    setCache(c => ({ ...c, [key]: value }));
  }

  return (
    <DataCacheContext.Provider value={{ cache, setCached }}>
      {children}
    </DataCacheContext.Provider>
  );
}
