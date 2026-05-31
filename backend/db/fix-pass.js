const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false
});

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE email = $2', [hash, 'emixnahuel@gmail.com']);
  console.log('Password reset to 123456 for emixnahuel@gmail.com');
  process.exit(0);
}

main();
