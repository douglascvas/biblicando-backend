'use strict';
import {Inject} from "./decorators/inject";
import {ObjectUtils} from "./service/objectUtils";

const log4js = require('log4js');

@Inject
export class LoggerFactory {
  constructor(private config) {
    const loggerConfig = config.get('logger') || {};
    log4js.configure(loggerConfig);
  }

  public getLogger = function (ref) {
    if (typeof ref !== 'string') {
      ref = ObjectUtils.extractClassName(ref);
    }
    return log4js.getLogger(ref);
  };
}