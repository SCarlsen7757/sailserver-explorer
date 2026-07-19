import { useState, useRef } from 'react';
import { Download, CheckCircle } from 'lucide-react';
import { getTracks, getTrack } from '../../services/api';
import { toCsv, downloadCsv } from '../../utils/csv';

// Avoids toISOString(), which can shift the calendar date across midnight in non-UTC timezones
function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const CSV_HEADERS = ['trackid', 'point_index', 'unix_time', 'utc', 'lat', 'lon', 'sog_kn', 'cog_deg'];

export default function ExportPanel({ apikey }) {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateInputValue(d);
  });
  const [toDate, setToDate] = useState(() => toDateInputValue(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const cancelRef = useRef(false);

  const rangeInvalid = Boolean(fromDate && toDate && fromDate > toDate);

  async function runExport() {
    setLoading(true);
    setError(null);
    setNotice(null);
    setResult(null);
    setProgress(null);
    cancelRef.current = false;
    let currentTrackid = null;
    try {
      const tracks = await getTracks(apikey);
      // Track start/stop times are local "YYYY-MM-DD HH:MM" strings; lexicographic
      // comparison is correct and avoids Date-parsing/timezone pitfalls.
      const fromKey = `${fromDate} 00:00`;
      const toKey = `${toDate} 23:59`;
      const matches = (tracks ?? [])
        .filter(t =>
          (t.start?.time ?? '') <= toKey &&
          (!t.stop?.time || t.stop.time >= fromKey)) // missing stop = in-progress, open-ended
        .sort((a, b) => (a.start?.time ?? '').localeCompare(b.start?.time ?? ''));

      if (matches.length === 0) {
        setNotice(`No tracks between ${fromDate} and ${toDate}.`);
        return;
      }

      const rows = [];
      for (let i = 0; i < matches.length; i++) {
        if (cancelRef.current) {
          setNotice('Export cancelled — no file was downloaded.');
          return;
        }
        const t = matches[i];
        currentTrackid = t.trackid;
        setProgress({ done: i, total: matches.length, trackid: t.trackid });
        const points = await getTrack(apikey, t.trackid);
        for (const p of points ?? []) {
          rows.push([t.trackid, p.i, p.tim, p.utc, p.lat, p.lon, p.sog, p.cog]);
        }
      }
      currentTrackid = null;

      const filename = `sailserver-trackpoints_${fromDate}_${toDate}.csv`;
      downloadCsv(filename, toCsv(CSV_HEADERS, rows));
      setResult({ trackCount: matches.length, pointCount: rows.length, filename });
    } catch (e) {
      setError(currentTrackid !== null
        ? `Failed fetching track #${currentTrackid}: ${e.message} — no file was downloaded.`
        : e.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2><Download size={20} strokeWidth={1.75} /> CSV Export</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="panel-content">
        <div className="card">
          <h3><Download size={14} /> Track Points by Date Range</h3>
          <p className="export-desc">
            Exports every GPS point (time, position, speed, course) from all tracks that
            overlap the selected date range into one CSV file. Overlapping tracks are
            included whole.
          </p>
          <div className="export-form">
            <label className="export-field">
              From
              <input type="date" value={fromDate} max={toDate || undefined}
                onChange={e => setFromDate(e.target.value)} disabled={loading} />
            </label>
            <label className="export-field">
              To
              <input type="date" value={toDate} min={fromDate || undefined}
                onChange={e => setToDate(e.target.value)} disabled={loading} />
            </label>
            <button onClick={runExport} disabled={loading || !fromDate || !toDate || rangeInvalid}>
              <Download size={15} strokeWidth={1.75} /> Export
            </button>
            {loading && (
              <button type="button" className="btn-secondary" onClick={() => { cancelRef.current = true; }}>
                Cancel
              </button>
            )}
          </div>
          {rangeInvalid && <div className="export-hint">“From” must be on or before “To”.</div>}
        </div>

        {loading && (
          <div className="card export-progress">
            {progress ? (
              <>
                <progress value={progress.done} max={progress.total} />
                <span>Fetching track {progress.done + 1} of {progress.total} — #{progress.trackid}</span>
              </>
            ) : (
              <span>Fetching track list…</span>
            )}
          </div>
        )}

        {result && (
          <div className="card export-result">
            <CheckCircle size={16} />
            Exported {result.pointCount.toLocaleString()} points from {result.trackCount} track{result.trackCount === 1 ? '' : 's'} → <code>{result.filename}</code>
          </div>
        )}

        {notice && <div className="empty-state">{notice}</div>}
        {!loading && !result && !notice && !error && (
          <div className="empty-state">Pick a date range and click Export.</div>
        )}
      </div>
    </div>
  );
}
