export const CONSTANTS ={
    API_TIMEOUT: 10000, // 10 seconds
    TOKEN_REFRESH_THRESHOLD: 5* 60 * 1000, //Renovate 5 second before expire
    DEVICE_DICONNECT_THRESHOLD: 15* 60 * 1000, //Disconnect device after 15 minutes of inactivity

    MAX_LOGIN_ATTEMPTS: 5, 
    LOCK_TIME_AFTER_FAILED_LOGIN: 15* 60 * 1000, //Lock user after 15 minutes of failed login attempts
    EMAIL_VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, //Email verification token expires after 24 hours
    PASSWORD_RESET_TOKEN_EXPIRY: 1*60*60*1000,

    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,

    STORAGE_KEY_ACCESS_TOKEN: '@auth:access_token',
    STORAGE_KEY_REFRESH_TOKEN: '@auth:refresh_token',
    STORAGE_KEY_USER: '@auth:user',

    ALERT_DRAIN_THRESHOLD_MINUTES: 30,
    ALERT_GOAL_ACHIEVED_THRESHOLD: 100,
    ALERT_PREVENTIVE_GOAL_THRESHOLD: 80,
}