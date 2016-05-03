'use strict';

const log4js = require('log4js');

export class Logger {
  constructor(private config) {
    const loggerConfig = config.get('logger') || {};
    log4js.configure(loggerConfig);
  }

  public getLogger = log4js.getLogger;
}

module.exports = Logger;