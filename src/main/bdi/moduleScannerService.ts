'use strict';

import * as glob from "glob";
import * as path from "path";
import {ObjectUtils} from "../common/service/objectUtils";

export interface ClassInfo {
  name: string,
  classz: Function
}

export class ModuleScannerService {
  private async getUnits(includePaths?: string[], excludePaths?: string[]): Promise<Map<string, any>> {
    const result: Map<string, any> = new Map();

    includePaths = (includePaths && includePaths.length) ? includePaths : [path.resolve(`${__dirname}/..`) + '/**/*.js'];
    const mainPattern: string = includePaths.join('|');
    const options: any = {};
    if (excludePaths && excludePaths.length) {
      options.ignore = excludePaths.join('|');
    }

    let files: any[] = await this.searchFiles(mainPattern, options);
    files.forEach(file => this.extractModuleInfo(file, result));
    return result;
  }

  private searchFiles(mainPattern: string, options: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      glob(mainPattern, options, function (err, files) {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    });
  }

  private extractModuleInfo(file, result: Map<string, any>) {
    const mod = require(path.resolve(file));
    const entries = ObjectUtils.toIterable(mod);
    for (let entry of entries) {
      result.set(entry.key, entry.value);
    }
  }

  public async scan(includePaths?: string[], excludePaths?: string[]): Promise<ClassInfo[]> {
    let result: ClassInfo[] = [];
    let units: Map<string, Function> = await this.getUnits();
    for (let entry of units.entries()) {
      let [key, value] = entry;
      if (typeof value === 'function') {
        result.push({name: key, classz: value});
      }
    }
    return result;
  }

}