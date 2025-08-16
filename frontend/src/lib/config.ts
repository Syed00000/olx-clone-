// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://olxbackend-black.vercel.app' 
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

// Debug logging
if (typeof window !== 'undefined') {
  console.log('Environment Configuration:', {
    hostname: window.location.hostname,
    apiBaseUrl: config.api.baseUrl,
    isDevelopment: config.env.isDevelopment,
    isProduction: config.env.isProduction,
  });
}
