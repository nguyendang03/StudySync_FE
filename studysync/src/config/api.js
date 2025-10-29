// API Configuration
// - Development: Uses relative path '/api/v1' which is proxied by Vite to http://localhost:3000
// - Production (Vercel): 
//   Option 1: Set VITE_API_URL in Vercel dashboard to your backend URL (recommended)
//   Option 2: Use '/api/v1' with Vercel rewrites (update vercel.json)

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

// Log for debugging (only in browser, not SSR)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('🌐 API Configuration:', {
    mode: import.meta.env.PROD ? 'production' : 'development',
    apiBaseUrl: API_BASE_URL,
    hostname: window.location.hostname,
    viteApiUrl: import.meta.env.VITE_API_URL || 'not set (using relative path)'
  });
}

export default API_BASE_URL;