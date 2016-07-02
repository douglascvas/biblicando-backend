'use strict';

import {Promise} from "../interface/promise";

export interface CacheClient {
  get(key:string):Promise<any>;
  set(key:string, value:any, timeoutInMillis:number):Promise<void>;
  refresh(key, timeoutInMillis):Promise<void>;
  remove(key):Promise<void>;
}
