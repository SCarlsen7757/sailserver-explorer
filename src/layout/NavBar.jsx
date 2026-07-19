import { NavLink } from 'react-router';
import { Sailboat, List, Clock, MapPin, Wrench, Download } from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Explore',
    items: [
      { to: '/explore/boat',       label: 'Boat',         icon: Sailboat, cmd: 'getboat' },
      { to: '/explore/tracks',     label: 'All Tracks',   icon: List,     cmd: 'gettracks' },
      { to: '/explore/last-track', label: 'Last Track',   icon: Clock,    cmd: 'getlasttrack' },
      { to: '/explore/track',      label: 'Track Detail', icon: MapPin,   cmd: 'gettrack' },
      { to: '/explore/dev',        label: 'Dev',          icon: Wrench,   cmd: null },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/tools/csv-export',   label: 'CSV Export',   icon: Download, cmd: null },
    ],
  },
];

export default function NavBar() {
  return (
    <nav className="side-nav">
      {NAV_GROUPS.map(group => (
        <div key={group.label} className="nav-group">
          <span className="nav-group-label">{group.label}</span>
          {group.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} strokeWidth={1.75} />
              <span className="nav-label">{item.label}</span>
              {item.cmd && <code className="cmd-badge">{item.cmd}</code>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
