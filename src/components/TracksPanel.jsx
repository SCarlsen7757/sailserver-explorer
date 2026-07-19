import { useState } from 'react';
import { List } from 'lucide-react';
import { getTracks } from '../services/api';
import MapView from './MapView';
import { getTrack } from '../services/api';

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// All rep stats are optional per the API spec — show a dash when missing
function fmtNum(value, digits, suffix = '') {
  return value != null ? `${value.toFixed(digits)}${suffix}` : '—';
}

function SortHeader({ field, label, sortField, sortDir, onSort }) {
  return (
    <th onClick={() => onSort(field)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      {label} {sortField === field ? (sortDir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );
}

export default function TracksPanel({ apikey }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackPoints, setTrackPoints] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [sortField, setSortField] = useState('start.time');
  const [sortDir, setSortDir] = useState('desc');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getTracks(apikey);
      setTracks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function viewTrack(track) {
    setSelectedTrack(track);
    setTrackPoints(null);
    setTrackLoading(true);
    try {
      const points = await getTrack(apikey, track.trackid);
      setTrackPoints(points);
    } catch (e) {
      setError(e.message);
    } finally {
      setTrackLoading(false);
    }
  }

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  }

  function getValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  const sorted = [...tracks].sort((a, b) => {
    const av = getValue(a, sortField);
    const bv = getValue(b, sortField);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const sortProps = { sortField, sortDir, onSort: toggleSort };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><List size={20} strokeWidth={1.75} /> All Tracks</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Fetch'}</button>
      </div>
      {error && <div className="error">{error}</div>}

      {tracks.length > 0 && (
        <div className="panel-layout">
          <div className="panel-data">
            <div className="tracks-count">{tracks.length} tracks</div>
            <div className="table-scroll">
              <table className="data-table tracks-table">
                <thead>
                  <tr>
                    <SortHeader field="trackid" label="ID" {...sortProps} />
                    <SortHeader field="start.time" label="Start" {...sortProps} />
                    <SortHeader field="stop.time" label="Stop" {...sortProps} />
                    <SortHeader field="rep.totdist" label="Dist (nm)" {...sortProps} />
                    <SortHeader field="rep.avespd" label="Avg Spd" {...sortProps} />
                    <SortHeader field="rep.maxspd" label="Max Spd" {...sortProps} />
                    <SortHeader field="rep.tottime" label="Duration" {...sortProps} />
                    <th>Map</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(t => (
                    <tr
                      key={t.trackid}
                      className={selectedTrack?.trackid === t.trackid ? 'selected-row' : ''}
                    >
                      <td>{t.trackid}</td>
                      <td>{t.start.time}</td>
                      <td>{t.stop.time}</td>
                      <td>{fmtNum(t.rep.totdist, 2)}</td>
                      <td>{fmtNum(t.rep.avespd, 2, ' kn')}</td>
                      <td>{fmtNum(t.rep.maxspd, 2, ' kn')}</td>
                      <td>{formatDuration(t.rep.tottime)}</td>
                      <td>
                        <button className="btn-small" onClick={() => viewTrack(t)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTrack && (
              <div className="selected-track-info">
                <strong>Track #{selectedTrack.trackid}</strong>
                {' — '}
                {selectedTrack.start.time} → {selectedTrack.stop.time}
                {' | '}
                {fmtNum(selectedTrack.rep.totdist, 2, ' nm')}
                {' | '}
                Avg {fmtNum(selectedTrack.rep.avespd, 2, ' kn')} / Max {fmtNum(selectedTrack.rep.maxspd, 2, ' kn')}
              </div>
            )}
          </div>

          <div className="panel-map">
            <div className="map-container">
              {trackLoading
                ? <div className="map-loading">Loading track…</div>
                : <MapView points={trackPoints} />
              }
            </div>
          </div>
        </div>
      )}

      {tracks.length === 0 && !loading && (
        <div className="empty-state">Click Fetch to load all tracks</div>
      )}
    </div>
  );
}
