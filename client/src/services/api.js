/**
 * SkillForge Centralized API Configuration & Base URL Provider
 *
 * Normalizes VITE_API_URL to guarantee that all API requests consistently
 * route to the backend's mounted '/api' prefix, regardless of whether
 * the environment variable is configured with or without trailing slashes
 * or the '/api' suffix:
 *   - https://skillforge-backend-46fm.onrender.com       -> https://skillforge-backend-46fm.onrender.com/api
 *   - https://skillforge-backend-46fm.onrender.com/      -> https://skillforge-backend-46fm.onrender.com/api
 *   - https://skillforge-backend-46fm.onrender.com/api   -> https://skillforge-backend-46fm.onrender.com/api
 *   - https://skillforge-backend-46fm.onrender.com/api/  -> https://skillforge-backend-46fm.onrender.com/api
 *   - (undefined / empty)                                -> http://localhost:5000/api
 */

export const normalizeApiUrl = (rawUrl) => {
  const base = rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== ''
    ? rawUrl.trim()
    : 'http://localhost:5000/api';
  const cleanBase = base.replace(/\/+$/, '');
  return cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;
};

export const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL);

export default API_URL;
