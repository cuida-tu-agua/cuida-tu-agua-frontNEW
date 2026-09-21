export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api',  

    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',

    LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',
};

if (!ENV.API_URL) {
    console.warn('Api_URL is not defined. Use the default URL')
}