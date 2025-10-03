/**
 * Authentication middleware for securing console routes (Basic Auth)
 * Shows browser login prompt via WWW-Authenticate header.
 */

export const consoleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Helper: trigger browser login dialog
  const requireAuth = (msg = 'Authentication required') => {
    res.set('WWW-Authenticate', 'Basic realm="Hiki Vision Console"');
    return res.status(401).json({ error: msg });
  };

  if (!authHeader) return requireAuth('Authorization header is required');
  if (!authHeader.startsWith('Basic ')) return requireAuth('Basic authentication is required');

  try {
    const base64 = authHeader.split(' ')[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf8');
    const [username, password] = decoded.split(':');

    const validUsername = process.env.CONSOLE_USERNAME || 'admin';
    const validPassword = process.env.CONSOLE_PASSWORD || 'admin123';

    if (username === validUsername && password === validPassword) {
      return next();
    }
    return requireAuth('Invalid credentials');
  } catch (err) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};
