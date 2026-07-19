import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { getTrack } from '../../services/api';
import { useDataCache } from '../../context/dataCacheContext';
import MapView from '../../components/MapView';

export default function TrackPanel({ apikey }) {
  const { cache, setCached } = useDataCache();
  const fetched = cache.gettrack ?? null;
  const points = fetched?.points ?? null;
  const [trackid, setTrackid] = useState(fetched?.trackid ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (!trackid) return;
    setLoading(true);
    setError('');
    setCached('gettrack', null);
    try {
      const data = await getTrack(apikey, trackid);
      setCached('gettrack', { trackid, points: data });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const maxSog = points?.length ? Math.max(...points.map(p => p.sog)) : null;
  const avgSog = points?.length ? points.reduce((s, p) => s + p.sog, 0) / points.length : null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><MapPin size={20} strokeWidth={1.75} /> Track Detail</h2>
        <div className="track-input-row">
          <input
            type="text"
            placeholder="Enter Track ID"
            value={trackid}
            onChange={e => setTrackid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
          />
          <button onClick={load} disabled={loading || !trackid}>
            {loading ? 'Loading…' : 'Fetch'}
          </button>
        </div>
      </div>
      {error && <div className="error">{error}</div>}

      {points && (
        <div className="panel-layout">
          <div className="panel-data">
            <div className="info-grid">
              <div className="card">
                <h3>Track #{fetched?.trackid}</h3>
                <table className="data-table">
                  <tbody>
                    <tr><td>Points</td><td>{points.length}</td></tr>
                    <tr><td>Start</td><td>{points[0]?.utc ?? '—'}</td></tr>
                    <tr><td>End</td><td>{points[points.length - 1]?.utc ?? '—'}</td></tr>
                    <tr><td>Max SOG</td><td>{maxSog != null ? `${maxSog.toFixed(2)} kn` : '—'}</td></tr>
                    <tr><td>Avg SOG</td><td>{avgSog != null ? `${avgSog.toFixed(2)} kn` : '—'}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="card legend">
                <h3>Speed Legend</h3>
                <div className="legend-item"><span className="dot" style={{ background: '#6b7280' }} /> &lt; 2 kn</div>
                <div className="legend-item"><span className="dot" style={{ background: '#22c55e' }} /> 2–4 kn</div>
                <div className="legend-item"><span className="dot" style={{ background: '#3b82f6' }} /> 4–7 kn</div>
                <div className="legend-item"><span className="dot" style={{ background: '#f59e0b' }} /> 7–10 kn</div>
                <div className="legend-item"><span className="dot" style={{ background: '#ef4444' }} /> &gt; 10 kn</div>
              </div>
            </div>
          </div>

          <div className="panel-map">
            <div className="map-container">
              <MapView points={points} />
            </div>
          </div>
        </div>
      )}

      {!points && !loading && (
        <div className="empty-state">Enter a Track ID and click Fetch to view the track</div>
      )}
    </div>
  );
}
