import * as express from "express";
import {Server} from "../../../main/server";
import {LoggerFactory} from "../../../main/common/loggerFactory";
import {ApplicationManager} from "../../../main/bdi/applicationManager";

const path = require('path');
const Configurator = require('configurator-js');
const moduleInfo = require("../../../../package.json");

export class TestTool {
  private config;
  private loggerFactory: LoggerFactory;
  private server: Server;
  private app;
  private applicationManager: ApplicationManager;

  constructor() {
    this.app = express();
    this.config = this.loadConfiguration();
    this.loggerFactory = new LoggerFactory(this.config);
    this.applicationManager = new ApplicationManager(Server, this.app, this.loggerFactory);
    this.server = new Server(this.app, this.config, this.applicationManager, this.loggerFactory);
  }

  private loadConfiguration() {
    const CONFIG_PATH = path.resolve(__dirname, '../config/config.yml');
    console.log("Loading configuration from ", CONFIG_PATH);
    return new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
  }

  public initialize(startServer: boolean) {
    return this.server.initialize();
  }

}