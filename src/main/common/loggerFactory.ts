'use strict';
import {Config} from "./config";
import {Service, LoggerFactory} from "node-boot";

@Service("loggerFactory")
export class BiblicandoLoggerFactory extends LoggerFactory {
  constructor(private config?: Config) {
    super(config ? config.find('logger') || {} : {});
  }
}