import pool from '../config/db.js';
import redisClient from '../config/redis.js';
import useragent from 'useragent';
import geoip from 'geoip-lite';

export async function redirectUrl(req, res) {
  const { shortCode } = req.params;

  try {
    // 1. CHECK CACHE FIRST (The High-Performance Pathway)
    const cachedLongUrl = await redisClient.get(`url:${shortCode}`);
    const rules = await redisClient.hGetAll(`rules:${shortCode}`);

    if (cachedLongUrl && rules && Object.keys(rules).length > 0) {
      console.log(`⚡ [Redis] Cache HIT for code: ${shortCode}`);

      // A. Check Time Expiration from Cache
      if (rules.expiresAt !== 'NULL' && new Date() > new Date(rules.expiresAt)) {
        return res.status(410).send('<h1>⏳ Link Expired: This link is no longer available (Cached Rule).</h1>');
      }

      // B. Check Click Limit atomically via Redis counter
      if (rules.maxClicks !== 'NULL') {
        const remainingClicks = await redisClient.decr(`clicks:${shortCode}`);
        if (remainingClicks < 0) {
          return res.status(410).send('<h1>🔒 Secure Link Self-Destructed: Reached click limit (Cached Rule).</h1>');
        }
      }

      // Grab ID asynchronously for analytics tracking
      logAnalyticsByCode(shortCode, req);
      return res.redirect(302, cachedLongUrl);
    }

    // 2. FALLBACK TO DATABASE (Cache Miss Pathway)
    console.log(`🐢 [Postgres] Cache MISS for code: ${shortCode}. Fetching from DB...`);
    const query = 'SELECT id, long_url, max_clicks, expires_at FROM urls WHERE short_code = $1';
    const result = await pool.query(query, [shortCode]);

    if (result.rows.length === 0) {
      return res.status(404).send('<h1>404 Link Not Found</h1>');
    }

    const { id, long_url, max_clicks, expires_at } = result.rows[0];

    // Check Time Expiration
    if (expires_at && new Date() > new Date(expires_at)) {
      return res.status(410).send('<h1>⏳ Link Expired: This link is no longer available.</h1>');
    }

    // Check Click Limit against analytical tracking logs
    if (max_clicks !== null) {
      const countQuery = 'SELECT COUNT(*) FROM analytics WHERE url_id = $1';
      const countResult = await pool.query(countQuery, [id]);
      const currentClicks = parseInt(countResult.rows[0].count, 10);

      if (currentClicks >= max_clicks) {
        return res.status(410).send('<h1>🔒 Secure Link Self-Destructed: Reached click limit.</h1>');
      }
    }

    // Repopulate Redis so the next user benefits from speed
    let ttlSeconds = 86400;
    if (expires_at) {
      ttlSeconds = Math.max(1, Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000));
    }
    
    await redisClient.set(`url:${shortCode}`, long_url, { EX: ttlSeconds });
    await redisClient.hSet(`rules:${shortCode}`, {
      maxClicks: max_clicks !== null ? max_clicks.toString() : 'NULL',
      expiresAt: expires_at ? new Date(expires_at).toISOString() : 'NULL'
    });
    await redisClient.expire(`rules:${shortCode}`, ttlSeconds);
    
    if (max_clicks !== null) {
      const countQuery = 'SELECT COUNT(*) FROM analytics WHERE url_id = $1';
      const countResult = await pool.query(countQuery, [id]);
      const remaining = max_clicks - parseInt(countResult.rows[0].count, 10);
      await redisClient.set(`clicks:${shortCode}`, remaining.toString(), { EX: ttlSeconds });
    }

    logAnalytics(id, req);
    return res.redirect(302, long_url);

  } catch (error) {
    console.error('Error during redirection:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

async function logAnalytics(urlId, req) {
  try {
    const rawUserAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || 'Direct';

    const agent = useragent.parse(rawUserAgent);
    const browser = agent.toAgent(); 
    const os = agent.os.toString();   

    let platform = 'Direct / Browser';
    const uaLower = rawUserAgent.toLowerCase();
    if (uaLower.includes('discord')) platform = 'Discord';
    else if (uaLower.includes('whatsapp')) platform = 'WhatsApp';
    // ... (keep your other platform mapping checks here)

   // 🗺️ DYNAMIC GEOLOCATION LOGIC (FIXED LOCALHOST DETECTION)
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    
    let country = 'Unknown';
    let city = 'Unknown';

    // Normalize the IP string to check for localhost variations safely
    const cleanIp = ip.trim().toLowerCase();
    const isLocalhost = cleanIp === '::1' || 
                        cleanIp === '127.0.0.1' || 
                        cleanIp.includes('127.0.0.1') || 
                        cleanIp === '::ffff:127.0.0.1';

    if (isLocalhost) {
      console.log(`📡 Localhost detected [${ip}]. Fetching dynamic public IP path...`);
      try {
        // Using an alternate highly reliable public endpoint with a 3-second timeout safety
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (data && !data.error) {
          country = data.country_code || 'Unknown'; 
          city = data.city || 'Unknown';           
        } else if (data && data.error) {
          console.error('⚠️ ipapi.co returned an error payload:', data.reason);
        }
      } catch (apiErr) {
        // This will print out the exact network block in your terminal console if it fails!
        console.error('❌ Dynamic Public IP API lookup failed. Reason:', apiErr.message);
      }
    } else {
      // PRODUCTION PATH: Use the high-speed local binary database for real users
      const geo = geoip.lookup(ip);
      if (geo) {
        country = geo.country || 'Unknown';
        city = geo.city || 'Unknown';
      }
    }

    const query = `
      INSERT INTO analytics (url_id, browser, os, referrer, platform, country, city) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await pool.query(query, [urlId, browser, os, referrer, platform, country, city]);
    console.log(`📊 Analytics logged dynamically: [${platform}] from [${city}, ${country}]`);
  } catch (error) {
    console.error('Secondary background logging error:', error.message);
  }
}

async function logAnalyticsByCode(shortCode, req) {
  try {
    const res = await pool.query('SELECT id FROM urls WHERE short_code = $1', [shortCode]);
    if (res.rows.length === 0) return;
    // This calls the main function we just updated above!
    await logAnalytics(res.rows[0].id, req); 
  } catch (err) {
    console.error('Background caching worker exception:', err.message);
  }
}

/**
 * Controller to fetch analytics summary for a specific short code
 * GET /api/v1/analytics/:shortCode
 */
export async function getUrlAnalytics(req, res) {
  const { shortCode } = req.params;

  try {
    const query = `
      SELECT 
        u.short_code,
        u.long_url,
        u.max_clicks,
        u.expires_at,
        COUNT(a.id) AS total_clicks,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'clicked_at', a.clicked_at, 
            'browser', a.browser, 
            'os', a.os, 
            'referrer', a.referrer,
            'platform', a.platform,
            'country', a.country, 
            'city', a.city
          )
        ) FILTER (WHERE a.id IS NOT NULL) AS click_logs
      FROM urls u
      LEFT JOIN analytics a ON u.id = a.url_id
      WHERE u.short_code = $1
      GROUP BY u.id;
    `;

    const result = await pool.query(query, [shortCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}