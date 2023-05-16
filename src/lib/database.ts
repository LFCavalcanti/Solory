import { Pool } from 'pg';

let postgre: Pool;
let connPort: number = Number(process.env.PGSQL_PORT || '0');

postgre = new Pool({
  user: process.env.PGSQL_USER,
  password: process.env.PGSQL_PASSWORD,
  host: process.env.PGSQL_HOST,
  port: isNaN(connPort) ? 0 : connPort,
  database: process.env.PGSQL_DATABASE,
});

export default postgre;
