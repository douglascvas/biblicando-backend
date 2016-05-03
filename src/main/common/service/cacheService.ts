'use strict';
@Inject
export class CacheService {

  constructor(private cacheClient) {
  }

  public getFromCache(url) {
    return this.cacheClient.get(url)
      .then(value => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      });
  }

  public storeInCache(url, resource, timeout) {
    if (!resource) {
      return;
    }
    if (typeof resource !== 'string') {
      resource = JSON.stringify(resource)
    }
    if (resource) {
      return this.cacheClient.set(url, resource, timeout);
    }
    return Q();
  }
}