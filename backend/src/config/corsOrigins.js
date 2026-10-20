export const parseCorsOrigins = (value) => {
  const origins = (typeof value === 'string' ? value : '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length ? origins : ['http://localhost:5173'];
};
