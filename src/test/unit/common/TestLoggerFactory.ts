import {TestLogger} from "./TestLogger";
import {Logger, LoggerFactory, ObjectUtils} from "node-boot";

export class TestLoggerFactory implements LoggerFactory {
  private _loggers;

  constructor() {
    this._loggers = {};
  }

  public getLogger(loggerIdentifier: any): Logger {
    const name = (typeof loggerIdentifier === 'string') ? loggerIdentifier : ObjectUtils.extractClassName(loggerIdentifier);
    return new TestLogger(name);
  }
}
