const { pool } = require('../../db');

async function createUser({ tenantId, email, passwordHash, role = 'Member' }) {
  const result = await pool.query(
    `INSERT INTO users (tenant_id, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, tenant_id, email, role, created_at`,
    [tenantId, email, passwordHash, role]
  );
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await pool.query(
    `SELECT users.*, tenants.plan 
     FROM users 
     JOIN tenants ON users.tenant_id = tenants.id 
     WHERE users.email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

module.exports = { createUser, getUserByEmail };
