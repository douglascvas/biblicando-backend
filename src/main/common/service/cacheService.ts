'use strict';
import {Service, Optional} from "node-boot";

@Service
export class CacheService {

  constructor(private cacheClient) {
  }

  public get<T>(url: string): Promise<Optional<T>> {
    return this.cacheClient.get(url)
      .then(value => {
        if (typeof value === 'string') {
          value = <T>JSON.parse(value);
        }
        return <Optional<T>>((value === null || value === undefined) ? Optional.empty() : Optional.of(value));
      });
  }

  public set(url: string, resource: any, timeout?: number): Promise<void> {
    if (!resource) {
      return;
    }
    if (typeof resource !== 'string') {
      resource = JSON.stringify(resource)
    }
    if (resource) {
      return this.cacheClient.set(url, resource, timeout);
    }
    return <Promise<void>>Promise.resolve();
  }

  public remove(url: string): Promise<any> {
    return this.cacheClient.remove(url);
  }
}