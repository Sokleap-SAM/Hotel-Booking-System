import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const databaseUrl = process.env.DATABASE_URL;

  // Parse DATABASE_URL for production (Render/Neon)
  if (databaseUrl) {
    const url = new URL(databaseUrl.replace(/^'|'$/g, ''));
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1).split('?')[0],
      ssl:
        url.searchParams.get('sslmode') === 'require'
          ? { rejectUnauthorized: false }
          : false,
    };
  }

  // Fallback for local development
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_CONTAINER_PORT ?? '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
  };
});
