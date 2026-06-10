function normalizeUrl(value) {
  return value?.replace(/\/+$/, "");
}

function requiredClientEnv(name, devFallback) {
  const value = import.meta.env[name];
  if (value) return normalizeUrl(value);
  if (import.meta.env.DEV) return normalizeUrl(devFallback);
  throw new Error(`${name} is required for the production frontend build.`);
}

const devApiUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`;
const devSocketUrl = `${window.location.protocol}//${window.location.hostname}:5000`;

export const clientEnv = {
  apiUrl: requiredClientEnv("VITE_API_URL", devApiUrl),
  socketUrl: requiredClientEnv("VITE_SOCKET_URL", devSocketUrl),
};
