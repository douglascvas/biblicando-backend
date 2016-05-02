'use strict';

namespace common {
  import Redis = require("ioredis");
  import Q = require('q');

  export class RedisClient {
    private client;

    constructor(private config, private logger) {
      const redisConfig = config.get('cache');
      const host = redisConfig.host || 'localhost';
      const port = redisConfig.port || 6379;
      logger.debug(`Connecting to redis on ${host}:${port}`);
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

}