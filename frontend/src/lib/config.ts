// Environment configuration
// FORCE DEPLOYMENT - Updated at: 2024-12-19
export const config = {
  // API Configuration
  api: {
    baseUrl: typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://olxbackend-ah5zrdsil-syed00000s-projects.vercel.app' 
      : '',
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: 'OLX Clone',
    version: '1.0.0',
  },
  
  // Environment
  env: {
    isDevelopment: typeof window !== 'undefined' && window.location.hostname === 'localhost',
    isProduction: typeof window !== 'undefined' && window.location.hostname !== 'localhost',
  }
};

// Debug logging with timestamp
if (typeof window !== 'undefined') {
  console.log('Environment Configuration:', {
    hostname: window.location.hostname,
    apiBaseUrl: config.api.baseUrl,
    isDevelopment: config.env.isDevelopment,
    isProduction: config.env.isProduction,
    timestamp: new Date().toISOString(),
    version: '1.3.0' // Force cache busting
  });
}
