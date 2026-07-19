import { Routes, Route, Navigate } from 'react-router';
import { ApiKeyProvider } from './context/ApiKeyProvider';
import { useApiKey } from './context/apiKeyContext';
import AppLayout from './layout/AppLayout';
import BoatPanel from './features/explore/BoatPanel';
import TracksPanel from './features/explore/TracksPanel';
import LastTrackPanel from './features/explore/LastTrackPanel';
import TrackPanel from './features/explore/TrackPanel';
import DevPanel from './features/dev/DevPanel';
import ExportPanel from './features/export/ExportPanel';
import './index.css';

function AppRoutes() {
  const { apikey } = useApiKey();

  return (
    <Routes>
      {/* Redirects live outside AppLayout: its Outlet is key-gated, so a
          Navigate rendered inside it would never fire before a key is set */}
      <Route path="/" element={<Navigate to="/explore/boat" replace />} />
      <Route element={<AppLayout />}>
        <Route path="/explore/boat" element={<BoatPanel apikey={apikey} />} />
        <Route path="/explore/tracks" element={<TracksPanel apikey={apikey} />} />
        <Route path="/explore/last-track" element={<LastTrackPanel apikey={apikey} />} />
        <Route path="/explore/track" element={<TrackPanel apikey={apikey} />} />
        <Route path="/explore/dev" element={<DevPanel apikey={apikey} />} />
        <Route path="/tools/csv-export" element={<ExportPanel apikey={apikey} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ApiKeyProvider>
      <AppRoutes />
    </ApiKeyProvider>
  );
}
