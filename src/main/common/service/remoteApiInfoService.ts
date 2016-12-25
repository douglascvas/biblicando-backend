'use strict';
import {RemoteApiInfo, RemoteApiConfig} from "../enums/remoteApiInfo";
import {RemoteService} from "../interface/remoteService";
import {DefaultDependencyInjector, Service, Optional} from "node-boot";

@Service
export class RemoteApiInfoService {
  constructor(private dependencyInjector: DefaultDependencyInjector) {
  }

  public getService(name: string): Optional<RemoteService> {
    let remoteApiInfo: Optional<RemoteApiInfo> = this.resolveFromName(name);
    if (!remoteApiInfo.isPresent()) {
      throw new Error(`No service found for ${name}.`);
    }
    let remoteServiceClass: RemoteService = <RemoteService>remoteApiInfo.get().serviceClass;
    return <Optional<RemoteService>>this.dependencyInjector.findOne(remoteServiceClass);
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