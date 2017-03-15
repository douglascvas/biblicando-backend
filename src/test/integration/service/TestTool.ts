import * as express from "express";
import {IRouter} from "express-serve-static-core";
import {ApplicationManager, LoggerFactory} from "node-boot";
import {Server} from "../../../main/Server";
import {TestLoggerFactory} from "../../unit/common/TestLoggerFactory";

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
    this.loggerFactory = new TestLoggerFactory();
    this.applicationManager = new ApplicationManager(Server, this.app, this.loggerFactory);
    const router: IRouter = express.Router();
    this.server = new Server(this.app, this.config, router, this.loggerFactory);
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