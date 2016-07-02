'use strict';

import {Inject} from "../decorators/inject";
import {Promise} from "../interface/promise";

@Inject
export class CacheService {

  constructor(private cacheClient) {
  }

  public get(url:string):Promise<any> {
    return this.cacheClient.get(url)
      .then(value => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      });
  }

  public set(url:string, resource:any, timeout?:number):Promise<void> {
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

  public remove(url:string):Promise<any> {
    return this.cacheClient.remove(url);
  }
}