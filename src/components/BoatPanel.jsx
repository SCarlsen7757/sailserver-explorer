import { useState } from 'react';
import { Sailboat, CloudSun } from 'lucide-react';
import { getBoat } from '../services/api';
import MapView from './MapView';

function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

function windDirection(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export default function BoatPanel({ apikey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const d = await getBoat(apikey);
      setData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inst = data?.inst;
  const weather = data?.weather;

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
                <h3>{data.boatname}</h3>
                <table className="data-table">
                  <tbody>
                    <tr><td>Position</td><td>{inst.lat.toFixed(5)}, {inst.lon.toFixed(5)}</td></tr>
                    <tr><td>SOG</td><td>{inst.sog} kn</td></tr>
                    <tr><td>COG</td><td>{inst.cog}°</td></tr>
                    <tr><td>STW</td><td>{inst.stw} kn</td></tr>
                    <tr><td>CRS</td><td>{inst.crs}°</td></tr>
                    <tr><td>Wind Angle</td><td>{inst.wda}°</td></tr>
                    <tr><td>Water Temp</td><td>{inst.watmp} °C</td></tr>
                    <tr><td>Voltage</td><td>{inst.v} V</td></tr>
                    <tr><td>UTC</td><td>{inst.utc}</td></tr>
                  </tbody>
                </table>
              </div>

              {weather && (
                <div className="card">
                  <h3><CloudSun size={16} strokeWidth={1.5} /> Weather</h3>
                  <div className="weather-main">
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.weather.icon}@2x.png`}
                      alt={weather.weather.description}
                    />
                    <div>
                      <div className="weather-temp">{kelvinToCelsius(weather.temp)} °C</div>
                      <div className="weather-desc">{weather.weather.description}</div>
                    </div>
                  </div>
                  <table className="data-table">
                    <tbody>
                      <tr><td>Wind Speed</td><td>{weather.wind_speed} m/s</td></tr>
                      <tr><td>Wind Dir</td><td>{weather.wind_deg}° ({windDirection(weather.wind_deg)})</td></tr>
                      <tr><td>Clouds</td><td>{weather.clouds}%</td></tr>
                      <tr><td>UV Index</td><td>{weather.uvi}</td></tr>
                      <tr><td>At</td><td>{weather.reqtime}</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="panel-map">
            <div className="map-container">
              <MapView
                boatPos={{ lat: inst.lat, lon: inst.lon, boatname: data.boatname }}
                center={[inst.lat, inst.lon]}
              />
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
