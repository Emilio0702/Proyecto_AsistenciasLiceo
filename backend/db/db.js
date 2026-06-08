const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables de entorno del archivo .env si existe

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  user: !connectionString ? process.env.DB_USER : undefined,
  host: !connectionString ? process.env.DB_HOST : undefined,
  database: !connectionString ? process.env.DB_DATABASE : undefined,
  password: !connectionString ? process.env.DB_PASSWORD : undefined,
  port: !connectionString ? process.env.DB_PORT : undefined,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};