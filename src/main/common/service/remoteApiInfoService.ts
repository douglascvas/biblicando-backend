'use strict';

namespace common {
  export class RemoteApiInfoService {
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

}