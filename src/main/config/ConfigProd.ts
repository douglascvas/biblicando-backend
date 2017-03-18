import {Config, BibleConfig, DatabaseConfig, CacheConfig, ServerConfig, ApiConfig, LoggerConfig} from "./Config";

export class ConfigProd implements Config {
  bible: BibleConfig = {
    filter: {languageCode: {$regex: '^por|^en'}}
  };
  database: DatabaseConfig = {
    host: process.env.DB_HOST,
    port: 27017,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'biblicando'
  };
  cache: CacheConfig = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    configFile: process.env.CACHE_CONFIG_FILE,
    expirationInMillis: 100000
  };
  server: ServerConfig = {
    port: 3005
  };
  api: ApiConfig = {
    biblesOrg: {
      url: `https://${
        process.env.BIBLES_ORG_TOKEN
        }:@bibles.org/v2/`
    }
  };
  logger: LoggerConfig = {
    appenders: [{
      type: 'console'
    }]
  };
}