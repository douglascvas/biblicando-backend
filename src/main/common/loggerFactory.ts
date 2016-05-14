'use strict';
import {Inject} from "./decorators/inject";

const log4js = require('log4js');

@Inject()
export class LoggerFactory {
  constructor(private config) {
    const loggerConfig = config.get('logger') || {};
    log4js.configure(loggerConfig);
  }

  public getLogger = log4js.getLogger;
}