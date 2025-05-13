// IP Configuration
export const IP_CONFIG = {
  // Server IP addresses
  SERVER: {
    DEVELOPMENT: 'http://localhost:3000',
    PRODUCTION: 'https://api.powerhouse.com',
    STAGING: 'https://staging-api.powerhouse.com'
  },

  // Client IP addresses
  CLIENT: {
    DEVELOPMENT: 'http://localhost:5173',
    PRODUCTION: 'https://powerhouse.com',
    STAGING: 'https://staging.powerhouse.com'
  },

  // WebSocket IP addresses
  WEBSOCKET: {
    DEVELOPMENT: 'ws://localhost:3001',
    PRODUCTION: 'wss://ws.powerhouse.com',
    STAGING: 'wss://staging-ws.powerhouse.com'
  },

  // Get current environment
  getCurrentEnvironment() {
    return process.env.NODE_ENV || 'development';
  },

  // Get server URL based on environment
  getServerUrl() {
    const env = this.getCurrentEnvironment();
    return env === 'production' ? this.SERVER.PRODUCTION :
           env === 'staging' ? this.SERVER.STAGING :
           this.SERVER.DEVELOPMENT;
  },

  // Get client URL based on environment
  getClientUrl() {
    const env = this.getCurrentEnvironment();
    return env === 'production' ? this.CLIENT.PRODUCTION :
           env === 'staging' ? this.CLIENT.STAGING :
           this.CLIENT.DEVELOPMENT;
  },

  // Get WebSocket URL based on environment
  getWebSocketUrl() {
    const env = this.getCurrentEnvironment();
    return env === 'production' ? this.WEBSOCKET.PRODUCTION :
           env === 'staging' ? this.WEBSOCKET.STAGING :
           this.WEBSOCKET.DEVELOPMENT;
  }
};