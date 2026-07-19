import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix default leaflet icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

// MapContainer's center prop is initial-only, so follow center changes manually
function Recenter({ center }) {
  const map = useMap();
  const [lat, lon] = center;
  useEffect(() => {
    map.setView([lat, lon]);
  }, [lat, lon, map]);
  return null;
}

function speedColor(sog) {
  if (sog === undefined || sog === null) return '#3b82f6';
  if (sog < 2) return '#6b7280';
  if (sog < 4) return '#22c55e';
  if (sog < 7) return '#3b82f6';
  if (sog < 10) return '#f59e0b';
  return '#ef4444';
}

// Merge consecutive points in the same speed bucket into one polyline,
// so a long track renders as a handful of layers instead of one per point.
// Each segment keeps its own points so a click can resolve against exactly
// the line that was clicked, not the whole track.
function speedSegments(points) {
  const segments = [];
  let current = null;
  for (let i = 0; i < points.length - 1; i++) {
    const color = speedColor(points[i].sog);
    if (current && current.color === color) {
      current.points.push(points[i + 1]);
    } else {
      current = { color, points: [points[i], points[i + 1]] };
      segments.push(current);
    }
  }
  return segments;
}

function nearestPoint(points, latlng) {
  // Scale longitude so distance is compared in real terms, not raw degrees
  const lonScale = Math.cos((latlng.lat * Math.PI) / 180);
  let best = null;
  let bestDist = Infinity;
  for (const p of points) {
    const d = (p.lat - latlng.lat) ** 2 + ((p.lon - latlng.lng) * lonScale) ** 2;
    if (d < bestDist) { bestDist = d; best = p; }
  }
  return best;
}

/**
 * MapView props:
 *   points: Array<{ lat, lon, sog, cog, utc }> — track points
 *   boatPos: { lat, lon, boatname } — single boat marker
 *   center: [lat, lon] — fallback center
 */
export default function MapView({ points, boatPos, center }) {
  const defaultCenter = center || (points?.length ? [points[0].lat, points[0].lon] : [56.0, 10.0]);
  const defaultZoom = 12;
  // { point, ts, forPoints } — ts keys the Popup so re-clicking after close
  // reopens it; forPoints drops the popup when a different track is loaded
  const [active, setActive] = useState(null);
  const activePoint = active && active.forPoints === points ? active.point : null;

  return (
    <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {center && !points?.length && <Recenter center={center} />}

      {points && points.length > 0 && (
        <>
          <FitBounds points={points} />
          {speedSegments(points).map((seg, i) => (
            <Polyline
              key={i}
              positions={seg.points.map(p => [p.lat, p.lon])}
              color={seg.color}
              weight={4}
              opacity={0.9}
              eventHandlers={{
                click: e => setActive({ point: nearestPoint(seg.points, e.latlng), ts: Date.now(), forPoints: points }),
              }}
            />
          ))}
          {activePoint && (
            <Popup key={active.ts} position={[activePoint.lat, activePoint.lon]}>
              <div style={{ fontSize: 13 }}>
                <strong>{activePoint.utc}</strong><br />
                SOG: {activePoint.sog?.toFixed(2)} kn<br />
                COG: {activePoint.cog?.toFixed(1)}°
              </div>
            </Popup>
          )}
          <Marker position={[points[0].lat, points[0].lon]} icon={startIcon}>
            <Popup>Start: {points[0].utc}</Popup>
          </Marker>
          <Marker position={[points[points.length - 1].lat, points[points.length - 1].lon]} icon={endIcon}>
            <Popup>End: {points[points.length - 1].utc}</Popup>
          </Marker>
        </>
      )}

      {boatPos && (
        <Marker position={[boatPos.lat, boatPos.lon]}>
          <Popup><strong>{boatPos.boatname}</strong><br />Lat: {boatPos.lat.toFixed(5)}<br />Lon: {boatPos.lon.toFixed(5)}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
