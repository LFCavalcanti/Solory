import { Pool } from 'pg';

const connPort: number = Number(process.env.PGSQL_PORT || '0');
let postgre: Pool;

try {
  postgre = new Pool({
    user: process.env.PGSQL_USER,
    password: process.env.PGSQL_PASSWORD,
    host: process.env.PGSQL_HOST,
    port: isNaN(connPort) ? 0 : connPort,
    database: process.env.PGSQL_DATABASE,
  });
} catch (error) {
  console.error(error);
  throw new Error(
    'It was not possible to create a connection pool with the database',
  );
}

export default postgre;
