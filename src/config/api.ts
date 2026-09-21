import {ENV} from './env';
import {CONSTANTS} from './constants';

export const API_CONFIG ={
    baseURL: ENV.API_URL,

    timeout: CONSTANTS.API_TIMEOUT,

    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

export const API_ENDPOINTS = {
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_VERIFY_EMAIL: '/auth/verify-email',
    AUTH_FORGOT_PASSWORD: '/auth/forgot-password',

    USER_PROFILE: '/users/profile',
    USER_UPDATE: '/users/profile',

    PLACE_LIST: '/places',
    PLACE_CREATE: '/places',
    PLACE_UPDATE: '/places/:id',
    PLACE_DELETE: '/places/:id',

    CONSUMPTION_TODAY: '/consumption/today',
    CONSUMPTION_RANGE: '/consumption/range', 

    VALVE_STATUS: '/valve/status',
    VALVE_CLOSE: '/valve/close',
    VALVE_OPEN: '/valve/open',
}