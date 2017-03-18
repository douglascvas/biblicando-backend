'use strict';
import {Service, ConsoleLoggerFactory} from "node-boot";
import {Config} from "../config/Config";

@Service("loggerFactory")
export class BiblicandoLoggerFactory extends ConsoleLoggerFactory {
  constructor(private config?: Config) {
    super(config ? config.logger || {} : {});
  }
}