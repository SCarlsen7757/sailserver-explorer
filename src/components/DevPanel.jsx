import { useState } from 'react';
import { Sailboat, List, Clock, MapPin, Wrench, CloudSun, Copy, Check } from 'lucide-react';
import { JsonView, allExpanded, darkStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { callApi } from '../services/api';

const COMMANDS = [
  { cmd: 'getboat',      label: 'getboat — current boat & weather' },
  { cmd: 'gettracks',    label: 'gettracks — all tracks list' },
  { cmd: 'getlasttrack', label: 'getlasttrack — last track GPS points' },
  { cmd: 'gettrack',     label: 'gettrack — specific track by ID' },
];

function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

function windDir(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// Optional per the API spec — show a dash when the value is missing
function fmt(value, unit = '') {
  return value != null ? `${value}${unit}` : '—';
}

/* ── Parsed Summary views ── */

function BoatSummary({ data }) {
  const { inst, weather, boatname } = data;
  return (
    <div className="dev-parsed">
      <div className="dev-field-group">
        <div className="dev-group-title"><Sailboat size={14} strokeWidth={1.5} /> {boatname}</div>
        <Field label="UTC" value={inst.utc} />
        <Field label="Position" value={`${inst.lat.toFixed(5)}, ${inst.lon.toFixed(5)}`} />
        <Field label="SOG" value={`${inst.sog} kn`} />
        <Field label="COG" value={`${inst.cog}°`} />
        <Field label="STW" value={fmt(inst.stw, ' kn')} />
        <Field label="CRS" value={fmt(inst.crs, '°')} />
        <Field label="Wind angle" value={fmt(inst.wda, '°')} />
        <Field label="Water temp" value={fmt(inst.watmp, ' °C')} />
        <Field label="Voltage" value={fmt(inst.v, ' V')} />
      </div>
      {weather && (
        <div className="dev-field-group">
          <div className="dev-group-title"><CloudSun size={14} strokeWidth={1.5} /> Weather</div>
          <Field label="Temp" value={`${kelvinToCelsius(weather.temp)} °C`} />
          <Field label="Wind" value={`${weather.wind_speed} m/s from ${weather.wind_deg}° (${windDir(weather.wind_deg)})`} />
          <Field label="Clouds" value={fmt(weather.clouds, '%')} />
          <Field label="UV Index" value={fmt(weather.uvi)} />
          <Field label="Condition" value={weather.weather?.description ?? '—'} />
          <Field label="At" value={fmt(weather.reqtime)} />
        </div>
      )}
    </div>
  );
}

function TracksSummary({ data }) {
  return (
    <div className="dev-parsed">
      <div className="dev-field-group">
        <div className="dev-group-title"><List size={14} strokeWidth={1.75} /> {data.length} tracks</div>
        {data.slice(0, 10).map(t => (
          <div key={t.trackid} className="dev-track-row">
            <span className="dev-track-id">#{t.trackid}</span>
            <span className="dev-track-info">
              {t.start.time} → {t.stop.time}
            </span>
            <span className="dev-track-stat">{t.rep.totdist != null ? `${t.rep.totdist.toFixed(2)} nm` : '—'}</span>
            <span className="dev-track-stat">avg {t.rep.avespd != null ? `${t.rep.avespd.toFixed(1)} kn` : '—'}</span>
            <span className="dev-track-stat">max {t.rep.maxspd != null ? `${t.rep.maxspd.toFixed(1)} kn` : '—'}</span>
          </div>
        ))}
        {data.length > 10 && (
          <div className="dev-muted">… and {data.length - 10} more (see raw)</div>
        )}
      </div>
    </div>
  );
}

function LastTrackSummary({ data }) {
  const pts = data.data ?? [];
  const maxSog = pts.length ? Math.max(...pts.map(p => p.sog)) : 0;
  const avgSog = pts.length ? pts.reduce((s, p) => s + p.sog, 0) / pts.length : 0;
  return (
    <div className="dev-parsed">
      <div className="dev-field-group">
        <div className="dev-group-title"><Clock size={14} strokeWidth={1.75} /> Last Track</div>
        <Field label="Start" value={data.timestart} />
        <Field label="Stop" value={data.timestop} />
        <Field label="Moving" value={data.moving ? 'Yes' : 'No'} />
        <Field label="Points" value={pts.length} />
        <Field label="Max SOG" value={`${maxSog.toFixed(2)} kn`} />
        <Field label="Avg SOG" value={`${avgSog.toFixed(2)} kn`} />
      </div>
      {pts.length > 0 && (
        <div className="dev-field-group">
          <div className="dev-group-title">First point</div>
          <TrackPointFields p={pts[0]} />
          <div className="dev-group-title" style={{ marginTop: 12 }}>Last point</div>
          <TrackPointFields p={pts[pts.length - 1]} />
        </div>
      )}
    </div>
  );
}

function TrackSummary({ data, trackid }) {
  const maxSog = data.length ? Math.max(...data.map(p => p.sog)) : 0;
  const avgSog = data.length ? data.reduce((s, p) => s + p.sog, 0) / data.length : 0;
  return (
    <div className="dev-parsed">
      <div className="dev-field-group">
        <div className="dev-group-title"><MapPin size={14} strokeWidth={1.75} /> Track #{trackid}</div>
        <Field label="Points" value={data.length} />
        <Field label="Start UTC" value={data[0]?.utc} />
        <Field label="End UTC" value={data[data.length - 1]?.utc} />
        <Field label="Max SOG" value={`${maxSog.toFixed(2)} kn`} />
        <Field label="Avg SOG" value={`${avgSog.toFixed(2)} kn`} />
      </div>
      {data.length > 0 && (
        <div className="dev-field-group">
          <div className="dev-group-title">First point</div>
          <TrackPointFields p={data[0]} />
          <div className="dev-group-title" style={{ marginTop: 12 }}>Last point</div>
          <TrackPointFields p={data[data.length - 1]} />
        </div>
      )}
    </div>
  );
}

function TrackPointFields({ p }) {
  return (
    <>
      <Field label="UTC" value={p.utc} />
      <Field label="Lat" value={p.lat.toFixed(6)} />
      <Field label="Lon" value={p.lon.toFixed(6)} />
      <Field label="SOG" value={`${p.sog} kn`} />
      <Field label="COG" value={`${p.cog}°`} />
    </>
  );
}

function Field({ label, value }) {
  return (
    <div className="dev-field">
      <span className="dev-field-label">{label}</span>
      <span className="dev-field-value">{value}</span>
    </div>
  );
}

/* ── Fetch Snippet ── */

const API_URL = 'https://app.sailserver.com/mod/api.php';

function FetchSnippet({ cmd, trackid }) {
  return (
    <pre className="dev-snippet">
      <span className="snippet-comment">{`// POST body — ${API_URL}\n`}</span>
      {"{\n"}
      {"  "}<span className="snippet-key">"apikey"</span>{": '"}<span className="snippet-masked">****</span>{"',\n"}
      {"  "}<span className="snippet-key">"cmd"</span>{": '"}<span className="snippet-str">{cmd}</span>{"'"}
      {cmd === 'gettrack'
        ? <span>{",\n  "}<span className="snippet-key">"trackid"</span>{`: '${trackid}'`}</span>
        : null}
      {"\n}"}
    </pre>
  );
}

/* ── Main DevPanel ── */

export default function DevPanel({ apikey }) {
  const [cmd, setCmd] = useState('getboat');
  const [trackid, setTrackid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [showSnippet, setShowSnippet] = useState(false);
  const [copied, setCopied] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError('');
    setRawResponse(null);
    setParsedData(null);
    try {
      const json = await callApi(apikey, cmd, cmd === 'gettrack' ? String(trackid) : '');
      setParsedData({ cmd, data: json.data });
      setRawResponse(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="panel panel--dev">
      <div className="panel-header">
        <h2><Wrench size={18} strokeWidth={1.75} /> Dev Explorer</h2>
        <div className="dev-controls">
          <select
            value={cmd}
            onChange={e => { setCmd(e.target.value); setRawResponse(null); setParsedData(null); }}
          >
            {COMMANDS.map(c => (
              <option key={c.cmd} value={c.cmd}>{c.label}</option>
            ))}
          </select>

          {cmd === 'gettrack' && (
            <input
              type="text"
              placeholder="Track ID"
              value={trackid}
              onChange={e => setTrackid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchData()}
              style={{ width: 110 }}
            />
          )}

          <button onClick={fetchData} disabled={loading || (cmd === 'gettrack' && !trackid)}>
            {loading ? 'Loading…' : 'Fetch'}
          </button>

          <button className="btn-secondary" onClick={() => setShowSnippet(s => !s)}>
            {showSnippet ? 'Hide Snippet' : 'Show Snippet'}
          </button>
        </div>
      </div>

      {showSnippet && <FetchSnippet cmd={cmd} trackid={trackid} />}

      {error && <div className="error">{error}</div>}

      {!rawResponse && !loading && (
        <div className="empty-state">Select a command and click Fetch to explore the API response</div>
      )}

      {rawResponse && parsedData && (
        <div className="dev-split">
          {/* Left: Parsed view */}
          <div className="dev-pane">
            <div className="dev-pane-title">Parsed View</div>
            {parsedData.cmd === 'getboat' && <BoatSummary data={parsedData.data} />}
            {parsedData.cmd === 'gettracks' && <TracksSummary data={parsedData.data} />}
            {parsedData.cmd === 'getlasttrack' && <LastTrackSummary data={parsedData.data} />}
            {parsedData.cmd === 'gettrack' && <TrackSummary data={parsedData.data} trackid={trackid} />}
          </div>

          {/* Right: Raw JSON */}
          <div className="dev-pane">
            <div className="dev-pane-title">
              Raw JSON
              <div className="dev-pane-actions">
                <span className="dev-pane-hint">click ▶ to expand</span>
                <button className={`btn-copy${copied ? ' copied' : ''}`} onClick={copyJson}>
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                </button>
              </div>
            </div>
            <div className="dev-json-tree">
              <JsonView
                data={rawResponse}
                shouldExpandNode={allExpanded}
                style={darkStyles}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
