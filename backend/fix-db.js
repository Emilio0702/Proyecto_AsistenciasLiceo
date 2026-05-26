const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: 'postgres.vyedtlcjqszufxiithpb',
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  database: 'postgres',
  password: 'emiliojiron123',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function fixUsers() {
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);
  console.log('Nuevo Hash generado:', hash);

  try {
    // Actualizar solo el hash para evitar problemas de FK
    await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE email = $2',
      [hash, 'admin@serviterra.com']
    );

    await pool.query(
      'UPDATE usuarios SET password_hash = $1 WHERE email = $2',
      [hash, 'encargada1@serviterra.com']
    );

    console.log('Hashes actualizados correctamente en Supabase.');
    
    const result = await pool.query('SELECT email, password_hash FROM usuarios');
    console.log('Datos actuales en DB:', result.rows);

  } catch (error) {
    console.error('Error actualizando DB:', error);
  } finally {
    await pool.end();
  }
}

fixUsers();
