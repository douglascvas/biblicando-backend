export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface BibleConfig {
  filter: {
    languageCode: {
      $regex: string;
    }
  }
}

export interface CacheConfig {
  host: string;
  port: number;
  configFile?: string
  expirationInMillis: number;
}

export interface ServerConfig {
  port: number;
}

export interface ApiConfig {
  biblesOrg: {
    url: string
  }
}

export interface LoggerConfig {
  appenders: {
    type: string
  }
}

export abstract class Config {
  bible: BibleConfig;
  database: DatabaseConfig;
  cache: CacheConfig;
  server: ServerConfig;
  api: ApiConfig;
  logger: LoggerConfig
}