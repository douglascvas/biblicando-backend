import {Config, BibleConfig, DatabaseConfig, CacheConfig, ServerConfig, ApiConfig, LoggerConfig} from "../main/config/Config";

export class ConfigTest implements Config {
  bible: BibleConfig = {
    filter: {languageCode: {$regex: '^por|^en'}}
  };
  database: DatabaseConfig = {
    host: 'localhost',
    port: 27017,
    username: 'admin',
    password: 'admin',
    database: 'biblicando'
  };
  cache: CacheConfig = {
    host: 'localhost',
    port: 6379,
    configFile: '',
    expirationInMillis: 100000
  };
  server: ServerConfig = {
    port: 3005
  };
  api: ApiConfig = {
    biblesOrg: {
      url: `https://localhost:8080:@bibles.org/v2/`
    }
  };
  logger: LoggerConfig = {
    appenders: {
      type: 'console'
    }
  };
}