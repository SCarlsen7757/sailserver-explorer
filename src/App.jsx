import { useState } from 'react';
import { Sailboat, List, Clock, MapPin, Wrench, KeyRound } from 'lucide-react';
import BoatPanel from './components/BoatPanel';
import TracksPanel from './components/TracksPanel';
import LastTrackPanel from './components/LastTrackPanel';
import TrackPanel from './components/TrackPanel';
import DevPanel from './components/DevPanel';
import './index.css';

const TABS = [
  { id: 'boat',      label: 'Boat',         icon: Sailboat, cmd: 'getboat' },
  { id: 'tracks',    label: 'All Tracks',   icon: List,     cmd: 'gettracks' },
  { id: 'lasttrack', label: 'Last Track',   icon: Clock,    cmd: 'getlasttrack' },
  { id: 'track',     label: 'Track Detail', icon: MapPin,   cmd: 'gettrack' },
  { id: 'dev',       label: 'Dev',          icon: Wrench,   cmd: null },
];

export default function App() {
  const [apikey, setApikey] = useState('');
  const [activeTab, setActiveTab] = useState('boat');
  const [apikeyInput, setApikeyInput] = useState('');
  const [keySet, setKeySet] = useState(false);

  function handleSetKey(e) {
    e.preventDefault();
    if (apikeyInput.trim()) {
      setApikey(apikeyInput.trim());
      setKeySet(true);
    }
  }

  function handleClearKey() {
    setApikey('');
    setApikeyInput('');
    setKeySet(false);
  }

  return (
    <div className="app" data-theme={activeTab === 'dev' ? 'dev' : undefined}>
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

      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={15} strokeWidth={1.75} />
            {tab.label}
            {tab.cmd && <code className="cmd-badge">{tab.cmd}</code>}
          </button>
        ))}
      </nav>

      {!keySet && (
        <div className="key-warning">⚠️ Please enter your API key above to get started.</div>
      )}

      <main className="app-main">
        {keySet && (
          <>
            {activeTab === 'boat' && <BoatPanel apikey={apikey} />}
            {activeTab === 'tracks' && <TracksPanel apikey={apikey} />}
            {activeTab === 'lasttrack' && <LastTrackPanel apikey={apikey} />}
            {activeTab === 'track' && <TrackPanel apikey={apikey} />}
            {activeTab === 'dev' && <DevPanel apikey={apikey} />}
          </>
        )}
      </main>
    </div>
  );
}
