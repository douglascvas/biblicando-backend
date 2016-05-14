'use strict';

import * as Redis from "ioredis";
import {Inject} from "../decorators/inject";
import {LoggerFactory} from "../loggerFactory";

@Inject()
export class RedisClient {
  private client;
  private logger;

  constructor(private config, private loggerFactory:LoggerFactory) {
    this.logger = loggerFactory.getLogger('RedisClient');
    const redisConfig = config.get('cache');
    const host = redisConfig.host || 'localhost';
    const port = redisConfig.port || 6379;
    this.logger.debug(`Connecting to redis on ${host}:${port}`);
    this.client = new Redis(port, host, redisConfig);
  }

  private getClient() {
    return Q.when(this.client);
  }

  public get(key) {
    return this.getClient()
      .then(client => {
        return client.get(key);
      });
  }

  public set(key, value, timeoutInMillis) {
    if (timeoutInMillis) {
      return this.getClient()
        .then(client => client.psetex(key, timeoutInMillis, value));
    }
    return this.getClient()
      .then(client => client.set(key, value));
  }

  public refresh(key, timeoutInMillis) {
    return this.getClient()
      .then(client => client.pexpire(key, timeoutInMillis));
  }

  public remove(key) {
    return this.getClient()
      .then(client => client.delete(key));
  }
}
