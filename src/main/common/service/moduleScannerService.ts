'use strict';

const requireDir = require("require-dir-all");

export class ModuleScannerService {
  private getModules():Map<string, any> {
    var entries = new Map();
    requireDir('../../', {
      recursive: true,
      map: (mod) => {
        Object.keys(mod.exports).forEach(key => {
          if (mod.exports.hasOwnProperty(key)) {
            let classz = mod.exports[key];
            entries.set(key, classz);
          }
        });
      }
    });
    return entries;
  }

  public *getServices() {
    var self = this;
    for (let entry of this.getModules().entries()) {
      let [key, value] = entry;
      if (typeof value === 'function') {
        yield {name: key, value: value};
      }
    }
  }

}