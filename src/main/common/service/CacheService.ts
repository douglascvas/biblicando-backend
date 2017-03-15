'use strict';
import {Service} from "node-boot";

@Service
export class CacheService {

  constructor(private cacheClient) {
  }

  public async get<T>(url: string): Promise<T> {
    let value: T = await this.cacheClient.get(url);
    if (typeof value === 'string') {
      value = <T>JSON.parse(value);
    }
    return value;
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