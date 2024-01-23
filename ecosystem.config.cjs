module.exports = {
  apps: [
    {
      name: 'dictionordle-api',
      script: './index.js',
      watch: true,
      env: {
        PORT: 1234,
        NODE_ENV: 'development',
      },
      env_local: {
        PORT: 1234,
        NODE_ENV: 'development',
      },
      env_dev: {
        port: 8080,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 80,
        NODE_ENV: 'production',
      },
    },
  ],
};
