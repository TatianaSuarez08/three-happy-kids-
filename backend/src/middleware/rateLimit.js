export const createRateLimiter = ({ limit, windowMs }) => {
  const requestsByIp = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    if (!requestsByIp.has(ip) && requestsByIp.size >= 10000) {
      for (const [address, entry] of requestsByIp) {
        if (entry.resetAt <= now) requestsByIp.delete(address);
      }
      if (requestsByIp.size >= 10000) {
        res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
        return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' });
      }
    }

    let record = requestsByIp.get(ip);

    if (!record || record.resetAt <= now) {
      record = { count: 0, resetAt: now + windowMs };
    }

    if (record.count >= limit) {
      res.set('Retry-After', String(Math.ceil((record.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' });
    }

    record.count += 1;
    requestsByIp.set(ip, record);

    return next();
  };
};
