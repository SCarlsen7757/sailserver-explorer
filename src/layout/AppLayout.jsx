import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sailboat, KeyRound } from 'lucide-react';
import { useApiKey } from '../context/apiKeyContext';
import NavBar from './NavBar';

export default function AppLayout() {
  const { keySet, setKey, clearKey } = useApiKey();
  const [apikeyInput, setApikeyInput] = useState('');
  const { pathname } = useLocation();

  function handleSetKey(e) {
    e.preventDefault();
    if (apikeyInput.trim()) {
      setKey(apikeyInput);
    }
  }

  function handleClearKey() {
    setApikeyInput('');
    clearKey();
  }

  return (
    <div className="app" data-theme={pathname.startsWith('/explore/dev') ? 'dev' : undefined}>
      <header className="app-header">
        <div className="header-title">
          <span className="logo"><Sailboat size={28} strokeWidth={1.5} /></span>
          <h1>SailServer Explorer</h1>
        </div>
        <form className="apikey-form" onSubmit={handleSetKey}>
          {!keySet ? (
            <>
              <input
                type="password"
                placeholder="Enter API Key"
                value={apikeyInput}
                onChange={e => setApikeyInput(e.target.value)}
                className="apikey-input"
              />
              <button type="submit" disabled={!apikeyInput.trim()}>Set Key</button>
            </>
          ) : (
            <>
              <span className="key-set-label"><KeyRound size={14} /> API Key set</span>
              <button type="button" onClick={handleClearKey} className="btn-secondary">Clear</button>
            </>
          )}
        </form>
      </header>

      <div className="app-body">
        <NavBar />
        <div className="app-content">
          {!keySet && (
            <div className="key-warning">⚠️ Please enter your API key above to get started.</div>
          )}
          <main className="app-main">
            {keySet && <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
