const API_URL = 'https://app.sailserver.com/mod/api.php';

async function post(apikey, cmd, trackid = '') {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey, cmd, trackid }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.statuscode !== 200) throw new Error(json.message || `API error ${json.statuscode}`);
  return json.data;
}

export const getBoat = (apikey) => post(apikey, 'getboat');
export const getTracks = (apikey) => post(apikey, 'gettracks');
export const getLastTrack = (apikey) => post(apikey, 'getlasttrack');
export const getTrack = (apikey, trackid) => post(apikey, 'gettrack', String(trackid));
