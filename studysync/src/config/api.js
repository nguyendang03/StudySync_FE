
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it (for production backend URL)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.endsWith('/api/v1') 
      ? import.meta.env.VITE_API_URL 
      : `${import.meta.env.VITE_API_URL}/api/v1`;
  }
  
  // Default to relative path for both dev (Vite proxy) and production (Vercel rewrites)
  return '/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Log resolved target once in browser to see exactly where we connect
if (typeof window !== 'undefined') {
  try {
    const mode = import.meta.env.PROD ? 'production' : 'development';
    const usesEnv = !!import.meta.env.VITE_API_URL;
    const resolvedTarget = API_BASE_URL.startsWith('http')
      ? API_BASE_URL
      : `${window.location.origin}${API_BASE_URL}`;
    console.log(
      `🔗 API target: ${resolvedTarget} (${mode}, via ${usesEnv ? 'VITE_API_URL' : 'Vite proxy'})`
    );
  } catch (_) {
    // no-op
  }
}

export default API_BASE_URL;