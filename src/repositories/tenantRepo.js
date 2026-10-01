const { pool } = require('../../db');

async function createTenant(name, plan = 'free') {
  const result = await pool.query(
    `INSERT INTO tenants (name, plan)
     VALUES ($1, $2)
     RETURNING id, name, plan, created_at`,
    [name, plan]
  );
  return result.rows[0];
}

module.exports = { createTenant };
