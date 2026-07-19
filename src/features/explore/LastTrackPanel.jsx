import { useState } from 'react';
import { Clock } from 'lucide-react';
import { getLastTrack } from '../../services/api';
import { useDataCache } from '../../context/dataCacheContext';
import MapView from '../../components/MapView';

function formatDuration(start, stop) {
  const s = new Date(start.replace(' ', 'T'));
  const e = new Date(stop.replace(' ', 'T'));
  const diff = Math.round((e - s) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function LastTrackPanel({ apikey }) {
  const { cache, setCached } = useDataCache();
  const data = cache.getlasttrack ?? null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const d = await getLastTrack(apikey);
      setCached('getlasttrack', d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const points = data?.data ?? [];

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><Clock size={20} strokeWidth={1.75} /> Last Track</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Fetch'}</button>
      </div>
      {error && <div className="error">{error}</div>}

      {data && (
        <div className="panel-layout">
          <div className="panel-data">
            <div className="info-grid">
              <div className="card">
                <h3>Track Info</h3>
                <table className="data-table">
                  <tbody>
                    <tr><td>Start</td><td>{data.timestart}</td></tr>
                    <tr><td>Stop</td><td>{data.timestop}</td></tr>
                    <tr><td>Duration</td><td>{formatDuration(data.timestart, data.timestop)}</td></tr>
                    <tr><td>Points</td><td>{points.length}</td></tr>
                    <tr><td>Moving</td><td>{data.moving ? 'Yes' : 'No'}</td></tr>
                  </tbody>
                </table>
              </div>

              {points.length > 0 && (
                <div className="card">
                  <h3>Speed Summary</h3>
                  <table className="data-table">
                    <tbody>
                      <tr><td>Max SOG</td><td>{Math.max(...points.map(p => p.sog)).toFixed(2)} kn</td></tr>
                      <tr><td>Avg SOG</td><td>{(points.reduce((s, p) => s + p.sog, 0) / points.length).toFixed(2)} kn</td></tr>
                      <tr><td>Start Pos</td><td>{points[0].lat.toFixed(4)}, {points[0].lon.toFixed(4)}</td></tr>
                      <tr><td>End Pos</td><td>{points[points.length-1].lat.toFixed(4)}, {points[points.length-1].lon.toFixed(4)}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="panel-map">
            <div className="map-container">
              <MapView points={points} />
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="empty-state">Click Fetch to load the last track</div>
      )}
    </div>
  );
}
