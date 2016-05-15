'use strict';

import {Inject} from "../decorators/inject";
import * as Q from "q";
import {Promise} from "../interface/promise";

@Inject
export class CacheService {

  constructor(private cacheClient) {
  }

  public get(url:string):any {
    return this.cacheClient.get(url)
      .then(value => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      });
  }

  public set(url:string, resource:any, timeout:number):Promise<any> {
    if (!resource) {
      return;
    }
    if (typeof resource !== 'string') {
      resource = JSON.stringify(resource)
    }
    if (resource) {
      return this.cacheClient.set(url, resource, timeout);
    }
    return Q.when();
  }
}