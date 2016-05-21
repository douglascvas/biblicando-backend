'use strict';
import {Inject} from "./decorators/inject";
import {ObjectUtils} from "./service/objectUtils";

const log4js = require('log4js');

export interface Logger {
  info:(value:any) => void;
  warn:(value:any) => void;
  error:(value:any) => void;
  debug:(value:any) => void;
}

@Inject
export class LoggerFactory {
  constructor(private config?:any) {
    const loggerConfig = config ? config.get('logger') || {} : {};
    log4js.configure(loggerConfig);
  }

  public getLogger = function (ref):Logger {
    if (typeof ref !== 'string') {
      ref = ObjectUtils.extractClassName(ref);
    }
    return log4js.getLogger(ref);
  };
}