///<reference path="../optional.ts"/>
'use strict';
import {RemoteApiInfo, RemoteApiConfig} from "../enums/remoteApiInfo";
import {DefaultDependencyInjector} from "../../bdi/dependencyInjector/defaultDependencyInjector";
import {Named} from "../../bdi/decorator/di";
import {Optional} from "../optional";
import {RemoteService} from "../interface/remoteService";

@Named
export class RemoteApiInfoService {
  constructor(private dependencyInjector: DefaultDependencyInjector) {
  }

  public getService(name: string): Optional<RemoteService> {
    let remoteApiInfo: Optional<RemoteApiInfo> = this.resolveFromName(name);
    if (!remoteApiInfo.isPresent()) {
      throw new Error(`No service found for ${name}.`);
    }
    let remoteServiceClass: RemoteService = <RemoteService>remoteApiInfo.get().serviceClass;
    return this.dependencyInjector.findOne(remoteServiceClass);
  }

  public resolveFromName(name: string): Optional<RemoteApiInfo> {
    let keys = Reflect.ownKeys(RemoteApiConfig);
    for (let key of keys) {
      if (RemoteApiConfig[key].name === name) {
        return Optional.of(RemoteApiConfig[key]);
      }
    }
    return Optional.empty();
  }

  public listAll(): RemoteApiInfo[] {
    return Reflect.ownKeys(RemoteApiConfig)
      .map(key => {
        return RemoteApiConfig[key];
      })
      .filter(info => info);
  }
}