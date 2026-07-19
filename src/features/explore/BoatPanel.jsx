import { useState } from 'react';
import { Sailboat, CloudSun } from 'lucide-react';
import { getBoat } from '../../services/api';
import { useDataCache } from '../../context/dataCacheContext';
import MapView from '../../components/MapView';
import { fmt } from '../../utils/format';

function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function BoatPanel({ apikey }) {
  const { cache, setCached } = useDataCache();
  const data = cache.getboat ?? null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const d = await getBoat(apikey);
      setCached('getboat', d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inst = data?.inst;
  const weather = data?.weather;
  const hasPos = inst?.lat != null && inst?.lon != null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><Sailboat size={20} strokeWidth={1.5} /> Boat</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Fetch'}</button>
      </div>
      {error && <div className="error">{error}</div>}

      {data && (
        <div className="panel-layout">
          <div className="panel-data">
            <div className="info-grid">
              <div className="card">
                <h3>{data.boatname ?? 'Boat'}</h3>
                <table className="data-table">
                  <tbody>
                    <tr><td>Position</td><td>{hasPos ? `${inst.lat.toFixed(5)}, ${inst.lon.toFixed(5)}` : '—'}</td></tr>
                    <tr><td>SOG</td><td>{fmt(inst?.sog, ' kn')}</td></tr>
                    <tr><td>COG</td><td>{fmt(inst?.cog, '°')}</td></tr>
                    <tr><td>STW</td><td>{fmt(inst?.stw, ' kn')}</td></tr>
                    <tr><td>CRS</td><td>{fmt(inst?.crs, '°')}</td></tr>
                    <tr><td>Wind Angle</td><td>{fmt(inst?.wda, '°')}</td></tr>
                    <tr><td>Water Temp</td><td>{fmt(inst?.watmp, ' °C')}</td></tr>
                    <tr><td>Voltage</td><td>{fmt(inst?.v, ' V')}</td></tr>
                    <tr><td>UTC</td><td>{fmt(inst?.utc)}</td></tr>
                  </tbody>
                </table>
              </div>

              {weather && (
                <div className="card">
                  <h3><CloudSun size={16} strokeWidth={1.5} /> Weather</h3>
                  <div className="weather-main">
                    {weather.weather?.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.weather.icon}@2x.png`}
                        alt={weather.weather?.description ?? ''}
                      />
                    )}
                    <div>
                      <div className="weather-temp">{weather.temp != null ? `${kelvinToCelsius(weather.temp)} °C` : '—'}</div>
                      <div className="weather-desc">{weather.weather?.description ?? '—'}</div>
                    </div>
                  </div>
                  <table className="data-table">
                    <tbody>
                      <tr><td>Wind Speed</td><td>{fmt(weather.wind_speed, ' m/s')}</td></tr>
                      <tr><td>Wind Dir</td><td>{weather.wind_deg != null ? `${weather.wind_deg}° (${windDirection(weather.wind_deg)})` : '—'}</td></tr>
                      <tr><td>Clouds</td><td>{fmt(weather.clouds, '%')}</td></tr>
                      <tr><td>UV Index</td><td>{fmt(weather.uvi)}</td></tr>
                      <tr><td>At</td><td>{fmt(weather.reqtime)}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="panel-map">
            <div className="map-container">
              {hasPos ? (
                <MapView
                  boatPos={{ lat: inst.lat, lon: inst.lon, boatname: data.boatname }}
                  center={[inst.lat, inst.lon]}
                />
              ) : (
                <div className="map-loading">No position reported</div>
              )}
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="empty-state">Click Fetch to load boat data</div>
      )}
    </div>
  );
}
