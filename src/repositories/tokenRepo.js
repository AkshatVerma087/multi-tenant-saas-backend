const { pool } = require('../../db');

async function saveRefreshToken(userId, token, expiresInDays = 7) {
  const result = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '${expiresInDays} days')
     RETURNING *`,
    [userId, token]
  );
  return result.rows[0];
}

async function getRefreshToken(token) {
  const result = await pool.query(
    `SELECT t.*, u.tenant_id, u.email, u.role, ten.plan
     FROM refresh_tokens t
     JOIN users u ON t.user_id = u.id
     JOIN tenants ten ON u.tenant_id = ten.id
     WHERE t.token = $1 AND t.expires_at > NOW()`,
    [token]
  );
  return result.rows[0] || null;
}

async function revokeRefreshToken(token) {
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

module.exports = { saveRefreshToken, getRefreshToken, revokeRefreshToken };
