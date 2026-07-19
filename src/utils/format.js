// Optional per the API spec — show a dash when the boat doesn't report the value
export function fmt(value, unit = '') {
  return value != null ? `${value}${unit}` : '—';
}
