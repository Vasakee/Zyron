import { NODE_ENV, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from './keys';

const password = (REDIS_PASSWORD ?? '').trim();

const connection: {
  host: string;
  port: number;
  password?: string;
  requiresPassword: boolean;
} = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT, 10),
  requiresPassword: !!password,
};

if (password) {
  connection.password = password;
}

export default connection;
