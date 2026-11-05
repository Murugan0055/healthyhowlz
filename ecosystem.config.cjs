module.exports = {
  apps: [
    {
      name: 'healthyhowlz-backend',
      script: 'backend/src/server.js',
      instances: 1, // 1 instance recommended for SQLite to prevent database lock contention. (Use 'max' / cluster if using PostgreSQL)
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        JWT_SECRET: process.env.JWT_SECRET || 'healthyhowlz_production_jwt_secret_key_2026_secure',
        OFFICER_MASTER_PIN: process.env.OFFICER_MASTER_PIN || '1234'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true
    }
  ]
};
