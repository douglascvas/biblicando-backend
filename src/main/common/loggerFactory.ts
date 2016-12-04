'use strict';
import {Named} from "../bdi/decorator/di";
import {ObjectUtils} from "./service/objectUtils";
import {Config} from "./config";

const log4js = require('log4js');

@Named
export class LoggerFactory {
  constructor(private config?:Config) {
    const loggerConfig = config ? config.find('logger') || {} : {};
    log4js.configure(loggerConfig);
  }

  public getLogger = function (ref):Logger {
    if (typeof ref !== 'string') {
      ref = ObjectUtils.extractClassName(ref);
    }
    return new Logger(log4js.getLogger(ref));
  };
}

export class Logger {
  constructor(private _logger) {
  }

  public log(...args:String[]) {
    this._logger.debugLog.apply(this._logger, this._toArray(arguments));
  }

  public info(...args:String[]) {
    this._logger.info.apply(this._logger, this._toArray(arguments));
  }

  public error(...args:String[]) {
    this._logger.error.apply(this._logger, this._toArray(arguments));
  }

  public warn(...args:String[]) {
    this._logger.warn.apply(this._logger, this._toArray(arguments));
  }

  public debug(...args:any[]) {
    this._logger.debug.apply(this._logger, this._toArray(arguments));
  }

  private _toArray(args:IArguments):any[] {
    return Array.prototype.slice.apply(args);
  }

}