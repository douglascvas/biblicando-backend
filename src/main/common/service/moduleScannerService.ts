'use strict';

import * as glob from 'glob';
import * as path from 'path';
import {ObjectUtils} from "./objectUtils";

export class ModuleScannerService {
  private getModules():Map<string, any> {
    var result = new Map();

    var mainPath = path.resolve(`${__dirname}/../..`);
    var files = glob.sync(`${mainPath}/**/*.js`, {ignore: `${mainPath}/index.js`});
    files.forEach(function (file) {
      var mod = require(path.resolve(file));
      var entries = ObjectUtils.toIterable(mod);
      for (let entry of entries) {
        result.set(entry.key, entry.value);
      }
    });
    return result;
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