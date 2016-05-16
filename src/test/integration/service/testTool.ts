import {Server} from "../../../main/server";
import {ModuleScannerService} from "../../../main/common/service/moduleScannerService";
import {LoggerFactory} from "../../../main/common/loggerFactory";
import {DependencyInjector} from "../../../main/common/service/dependencyInjector";

const path = require('path');
const Configurator = require('configurator-js');
const moduleInfo = require("../../../../package.json");

export class TestTool {
  private _config;
  private _moduleScannerService:ModuleScannerService;
  private _loggerFactory:LoggerFactory;
  private _dependencyInjector:DependencyInjector;
  private _server:Server;

  constructor() {
    this._config = this.loadConfiguration();
    this._moduleScannerService = new ModuleScannerService();
    this._loggerFactory = new LoggerFactory(this._config);
    this._dependencyInjector = new DependencyInjector(this._loggerFactory);
    this._server = new Server(this._config, this._dependencyInjector, this._loggerFactory, this._moduleScannerService);
  }

  private loadConfiguration() {
    var CONFIG_PATH = path.resolve(__dirname, '../config/config.yml');
    console.log("Loading configuration from ", CONFIG_PATH);
    return new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
  }

  public initialize(startServer: boolean) {
    return this._server.initialize(startServer);
  }

  get config() {
    return this._config;
  }

  get moduleScannerService() {
    return this._moduleScannerService;
  }

  get loggerFactory() {
    return this._loggerFactory;
  }

  get dependencyInjector() {
    return this._dependencyInjector;
  }

  get server() {
    return this._server;
  }
}