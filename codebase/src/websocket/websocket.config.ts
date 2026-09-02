import { origins } from 'src/config';

export const WEBSOCKET_CONFIG = {
  cors: {
    origin: origins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6,
  allowEIO3: true,
};

export const WEBSOCKET_EVENTS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',

  AUTH_REQUIRED: 'auth_required',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',

  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
} as const;

export const WEBSOCKET_ERRORS = {
  AUTHENTICATION_REQUIRED: {
    code: 'AUTH_REQUIRED',
    message: 'Authentication is required',
  },
  INVALID_TOKEN: {
    code: 'INVALID_TOKEN',
    message: 'Invalid authentication token',
  },
  ROOM_FULL: {
    code: 'ROOM_FULL',
    message: 'Room has reached maximum capacity',
  },
  INVALID_DATA: {
    code: 'INVALID_DATA',
    message: 'Invalid data provided',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error occurred',
  },
} as const;
