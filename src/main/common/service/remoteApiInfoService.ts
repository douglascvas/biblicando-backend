'use strict';
import {RemoteApiInfo, RemoteApiConfig} from "../enums/remoteApiInfo";
import {DependencyInjector} from "./dependencyInjector";
import * as assert from "assert";
import {Inject} from "../decorators/inject";

@Inject
export class RemoteApiInfoService {
  constructor(private dependencyInjector:DependencyInjector) {
  }

  public getService(name:String):any {
    let remoteApiInfo = this.resolveFromName(name);
    assert(remoteApiInfo, `No service found for ${name}.`);
    let RemoteService:any = remoteApiInfo.serviceClass;
    return this.dependencyInjector.get(RemoteService);
  }

  public resolveFromName(name):RemoteApiInfo {
    let keys = Reflect.ownKeys(RemoteApiConfig);
    for (let key of keys) {
      if (RemoteApiConfig[key].name === name) {
        return RemoteApiConfig[key];
      }
    }
  }

  public listAll():RemoteApiInfo[] {
    return Reflect.ownKeys(RemoteApiConfig)
      .map(key => {
        return RemoteApiConfig[key];
      })
      .filter(info => info);
  }
}