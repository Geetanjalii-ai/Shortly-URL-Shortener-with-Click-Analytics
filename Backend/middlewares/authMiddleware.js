import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'shortly-secret-key-12345';

// Strict authentication middleware (rejects if unauthorized)
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
}

// Optional authentication middleware (allows anonymous but registers user if token is present)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      console.warn('Optional JWT verification failed:', error.message);
      // Fail silently to allow anonymous access
    }
  }

  next();
}
