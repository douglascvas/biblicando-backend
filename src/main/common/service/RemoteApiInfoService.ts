'use strict';
import {RemoteApiInfo, RemoteApiConfig} from "../enums/RemoteApiInfo";
import {RemoteService} from "../interface/remoteService";
import {DefaultDependencyInjector, Service} from "node-boot";

@Service
export class RemoteApiInfoService {
  constructor(private dependencyInjector: DefaultDependencyInjector) {
  }

  public getService(name: string): RemoteService {
    let remoteApiInfo: RemoteApiInfo = this.resolveFromName(name);
    if (!remoteApiInfo) {
      throw new Error(`No service found for ${name}.`);
    }
    let remoteServiceClass: RemoteService = <RemoteService>remoteApiInfo.serviceClass;
    return <RemoteService>this.dependencyInjector.findOne(remoteServiceClass).orElse(null);
  }

  public resolveFromName(name: string): RemoteApiInfo {
    let keys = Reflect.ownKeys(RemoteApiConfig);
    for (let key of keys) {
      if (RemoteApiConfig[key].name === name) {
        return RemoteApiConfig[key];
      }
    }
    return null;
  }

  public listAll(): RemoteApiInfo[] {
    return Reflect.ownKeys(RemoteApiConfig)
      .map(key => {
        return RemoteApiConfig[key];
      })
      .filter(info => info);
  }
}