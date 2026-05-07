# SailServer Explorer

A simple React app for exploring the [SailServer](https://app.sailserver.com) API.

Browse live boat data and recorded GPS tracks using your SailServer API key. Supported commands:

| Command | Description |
| --- | --- |
| `getboat` | Current boat position, instruments, and weather |
| `gettracks` | List of all recorded tracks with statistics |
| `getlasttrack` | GPS data points for the most recent track |
| `gettrack` | GPS data points for a specific track by ID |

A deployed version is available at: [scarlsen7757.github.io/sailserver-explorer](https://scarlsen7757.github.io/sailserver-explorer/)

## Requirements

- A SailServer account and API key from [app.sailserver.com](https://app.sailserver.com)
- Node.js (for local development)

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```
