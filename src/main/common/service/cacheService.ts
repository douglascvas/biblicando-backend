'use strict';

import {Inject} from "../decorators/inject";
import * as Q from "q";
import IPromise = Q.IPromise;

@Inject
export class CacheService {

  constructor(private cacheClient) {
  }

  public getFromCache(url: string): any {
    return this.cacheClient.getFromCache(url)
      .then(value => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      });
  }

  public saveToCache(url: string, resource: any, timeout: number): IPromise<any> {
    if (!resource) {
      return;
    }
    if (typeof resource !== 'string') {
      resource = JSON.stringify(resource)
    }
    if (resource) {
      return this.cacheClient.saveToCache(url, resource, timeout);
    }
    return Q.when();
  }
}