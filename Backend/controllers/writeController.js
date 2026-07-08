import pool from '../config/db.js';
import redisClient from '../config/redis.js';
import { encode } from '../utils/base62.js';

// Helper function to sync policies to Redis immediately upon creation
async function primeRedisCache(shortCode, longUrl, maxClicks, expiresAt) {
  try {
    const pipe = redisClient.multi();
    
    // Calculate TTL in seconds if an expiration date exists
    let ttlSeconds = 86400; // Default 24 hours for permanent links
    if (expiresAt) {
      ttlSeconds = Math.max(1, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    }

    // Cache core routing path
    pipe.set(`url:${shortCode}`, longUrl, { EX: ttlSeconds });

    // Cache policies metadata
    pipe.hSet(`rules:${shortCode}`, {
      maxClicks: maxClicks !== null ? maxClicks.toString() : 'NULL',
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'NULL'
    });
    pipe.expire(`rules:${shortCode}`, ttlSeconds);

    // If there is a click limit, initialize an atomic counter
    if (maxClicks !== null) {
      pipe.set(`clicks:${shortCode}`, maxClicks.toString(), { EX: ttlSeconds });
    }

    await pipe.exec();
    console.log(`⚡ [Redis] Warmup completed for code: ${shortCode} (TTL: ${ttlSeconds}s)`);
  } catch (err) {
    console.error('❌ Redis cache warmup failed:', err.message);
  }
}

export async function shortenUrl(req, res) {
  const { longUrl, customAlias, maxClicks, expiresInMinutes } = req.body; 

  if (!longUrl) {
    return res.status(400).json({ error: 'longUrl is required' });
  }

  try {
    new URL(longUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  let expiresAt = null;
  if (expiresInMinutes && !isNaN(expiresInMinutes)) {
    expiresAt = new Date(Date.now() + parseInt(expiresInMinutes, 10) * 60000);
  }

  const cleanMaxClicks = maxClicks && !isNaN(maxClicks) ? parseInt(maxClicks, 10) : null;

  try {
    // HANDLE CUSTOM ALIAS PATH
    if (customAlias && customAlias.trim() !== '') {
      const cleanAlias = customAlias.trim();

      if (cleanAlias.length < 3 || cleanAlias.length > 30) {
        return res.status(400).json({ error: 'Custom alias must be between 3 and 30 characters long.' });
      }

      const checkQuery = 'SELECT id FROM urls WHERE short_code = $1';
      const checkResult = await pool.query(checkQuery, [cleanAlias]);

      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'Custom alias is already taken.' });
      }

      const insertCustomQuery = `
        INSERT INTO urls (long_url, short_code, max_clicks, expires_at) 
        VALUES ($1, $2, $3, $4) RETURNING id
      `;
      const result = await pool.query(insertCustomQuery, [longUrl, cleanAlias, cleanMaxClicks, expiresAt]);
      
      // Warm up cache immediately
      await primeRedisCache(cleanAlias, longUrl, cleanMaxClicks, expiresAt);

      return res.status(201).json({
        message: 'URL shortened successfully with custom alias and policies',
        shortCode: cleanAlias,
        shortUrl: `http://localhost:3002/${cleanAlias}`,
        expiresAt,
        maxClicks: cleanMaxClicks
      });
    }

    // FALLBACK TO AUTO-GENERATED PATH
    const insertQuery = `
      INSERT INTO urls (long_url, max_clicks, expires_at) 
      VALUES ($1, $2, $3) RETURNING id
    `;
    const insertResult = await pool.query(insertQuery, [longUrl, cleanMaxClicks, expiresAt]);
    const autoId = insertResult.rows[0].id;

    const shortCode = encode(autoId);

    const updateQuery = 'UPDATE urls SET short_code = $1 WHERE id = $2';
    await pool.query(updateQuery, [shortCode, autoId]);

    // Warm up cache immediately
    await primeRedisCache(shortCode, longUrl, cleanMaxClicks, expiresAt);

    return res.status(201).json({
      message: 'URL shortened successfully with policies',
      shortCode,
      shortUrl: `http://localhost:3002/${shortCode}`,
      expiresAt,
      maxClicks: cleanMaxClicks
    });

  } catch (error) {
    console.error('Error during URL shortening:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}