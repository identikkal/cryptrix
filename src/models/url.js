const pool = require('../config/database');
const { generateShortCode } = require('../utils/shortCode');

async function createShortUrl(originalUrl, expiresAt = null, createdBy = null) {
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    shortCode = generateShortCode();
    const result = await pool.query(
      'SELECT id FROM urls WHERE short_code = $1',
      [shortCode]
    );
    isUnique = result.rows.length === 0;
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique short code');
  }

  const query = `
    INSERT INTO urls (short_code, original_url, expires_at, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING id, short_code, original_url, created_at, expires_at
  `;

  const result = await pool.query(query, [shortCode, originalUrl, expiresAt, createdBy]);
  return result.rows[0];
}

async function getUrlByShortCode(shortCode) {
  const query = `
    SELECT id, short_code, original_url, created_at, expires_at, click_count
    FROM urls
    WHERE short_code = $1
  `;

  const result = await pool.query(query, [shortCode]);
  return result.rows[0];
}

async function recordClick(urlId, userAgent, ipAddress) {
  const query = `
    UPDATE urls
    SET click_count = click_count + 1
    WHERE id = $1
    RETURNING click_count
  `;

  const result = await pool.query(query, [urlId]);

  await pool.query(
    `INSERT INTO clicks (url_id, user_agent, ip_address) VALUES ($1, $2, $3)`,
    [urlId, userAgent, ipAddress]
  );

  return result.rows[0];
}

async function getUrlStats(shortCode) {
  const query = `
    SELECT 
      u.id, u.short_code, u.original_url, u.created_at, u.expires_at, u.click_count,
      COUNT(c.id) as total_clicks,
      COUNT(DISTINCT DATE(c.clicked_at)) as unique_days
    FROM urls u
    LEFT JOIN clicks c ON u.id = c.url_id
    WHERE u.short_code = $1
    GROUP BY u.id
  `;

  const result = await pool.query(query, [shortCode]);
  return result.rows[0];
}

async function deleteUrl(shortCode) {
  const query = 'DELETE FROM urls WHERE short_code = $1 RETURNING id';
  const result = await pool.query(query, [shortCode]);
  return result.rows.length > 0;
}

async function listUrls(limit = 50, offset = 0) {
  const query = `
    SELECT id, short_code, original_url, created_at, expires_at, click_count
    FROM urls
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
}

module.exports = {
  createShortUrl,
  getUrlByShortCode,
  recordClick,
  getUrlStats,
  deleteUrl,
  listUrls,
};
