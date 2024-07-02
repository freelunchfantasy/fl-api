module.exports = {
  apps: [
    {
      name: 'freelunch-api',
      script: './index.js',
      watch: true,
      env: {
        PORT: 1234,
        NODE_ENV: 'development',
        JWT_PUBLIC_KEY: '64dbbf15979bdd08aeaf176c827303bbb4dab716098c27980d64af0ddfd5997b',
      },
      env_local: {
        PORT: 1234,
        NODE_ENV: 'development',
        JWT_PUBLIC_KEY: '64dbbf15979bdd08aeaf176c827303bbb4dab716098c27980d64af0ddfd5997b',
      },
      env_dev: {
        port: 8080,
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
