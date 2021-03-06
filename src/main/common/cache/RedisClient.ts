'use strict';

import * as Redis from "ioredis";
import {CacheClient} from "./CacheClient";
import {Service, LoggerFactory} from "node-boot";
import {Config} from "../../config/Config";

@Service('cacheClient')
export class RedisClient implements CacheClient {
  private client: any;
  private logger;

  constructor(private config: Config, private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger('RedisClient');
    const redisConfig = config.cache;
    const host: string = redisConfig.host || 'localhost';
    const port: number = redisConfig.port || 6379;
    this.logger.debug(`Connecting to redis on ${host}:${port}`);
    this.client = new Redis(port, host, redisConfig);
  }

  private getClient(): Promise<any> {
    return <Promise<any>>Promise.resolve(this.client);
  }

  public get(key: string): Promise<any> {
    return this.getClient()
      .then(client => {
        return client.get(key);
      });
  }

  public set(key: string, value: any, timeoutInMillis: number): Promise<void> {
    if (timeoutInMillis) {
      return this.getClient()
        .then(client => client.psetex(key, timeoutInMillis, value));
    }
    return this.getClient()
      .then(client => client.set(key, value));
  }

  public refresh(key, timeoutInMillis): Promise<void> {
    return this.getClient()
      .then(client => client.pexpire(key, timeoutInMillis));
  }

  public remove(key): Promise<void> {
    return this.getClient()
      .then(client => client.del(key));
  }
}
