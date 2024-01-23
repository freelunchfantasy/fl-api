import config from './config.json' assert { type: 'json' };

export const getConfig = env => {
  const appConfig = config[env];

  if (!appConfig) {
    throw new Error(`No configuration found for environment ${env}`);
  }
  return appConfig;
};
