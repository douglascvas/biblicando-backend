'use strict';
// Maps the stack trace to the right typescript sources
import * as sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import {ModuleScannerService} from "./common/service/moduleScannerService";
import {ValidationService} from "./common/service/validationService";
import {DependencyInjector} from "./common/service/dependencyInjector";
import {LoggerFactory} from "./common/loggerFactory";
import {ObjectUtils} from "./common/service/objectUtils";
import {Mongo} from "./common/database/mongo/mongo";
import * as request from "request-promise";
import * as bodyParser from "body-parser";

import * as express from "express";

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");
const path = require("path");

export class Server {
  private _logger;

  constructor(private app,
              private config,
              private dependencyInjector:DependencyInjector,
              private loggerFactory:LoggerFactory,
              private moduleScannerService:ModuleScannerService) {
    this._logger = loggerFactory.getLogger(Server);
  }

  static build() {
    const CONFIG_PATH = path.resolve(process.env.CONFIG_PATH || __dirname + "/../resources/config.yml");

    function loadConfiguration() {
      console.log("Loading configuration from ", CONFIG_PATH);
      return new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
    }

    var app = express();
    var config = loadConfiguration();
    var moduleScannerService = new ModuleScannerService();
    var loggerFactory = new LoggerFactory(config);
    var dependencyInjector = new DependencyInjector(loggerFactory);
    return new Server(app, config, dependencyInjector, loggerFactory, moduleScannerService);
  }

  public get logger(){
    return this._logger;
  }

  private configureServer() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
  }

  public start():any {
    const self = this;
    const serverConfig = self.config.get('server');
    self.registerApis();
    return self.app.listen(serverConfig.port, function () {
      self.logger.info(`Listening on port ${serverConfig.port}`);
    });
  }

  private registerServices(dependencyInjector) {
    var serviceEntries = this.moduleScannerService.getServices();
    for (let entry of serviceEntries) {
      dependencyInjector.service(entry.value);
    }
  }

  public initialize():Promise<any> {
    var self = this;
    const mongoDb:Mongo = new Mongo(self.config);
    return mongoDb.connect()
      .then(connection => {
        self.configureServer();
        self.registerDependencies(connection);
        self.registerSchemas();
      });
  }

  private registerDependencies(connection:any) {
    this.dependencyInjector.rename('redisClient', 'cacheClient');
    this.dependencyInjector.value('config', this.config);
    this.dependencyInjector.value('router', this.app);
    this.dependencyInjector.value('httpClient', request);
    this.dependencyInjector.value('database', connection);
    this.dependencyInjector.value('dependencyInjector', this.dependencyInjector);
    this.registerServices(this.dependencyInjector);
    this.dependencyInjector.build();
    return this.dependencyInjector;
  }

  /**
   * Activate the APIs registered by the controllers.
   */
  private registerApis() {
    var dependencies = ObjectUtils.toIterable(this.dependencyInjector.getAll());
    var app = this.dependencyInjector.get('router');
    for (let instance of dependencies) {
      if (!instance.value.$controller) {
        continue;
      }
      if (typeof instance.value.$controller.register !== 'function') {
        throw new Error(`The controller ${instance.name} must be annotated with @Controller`)
      }
      instance.value.$controller.register(app, instance.value, this.loggerFactory);
    }
  }

  /**
   * Register the generated schemas in the validator.
   */
  private registerSchemas() {
    var dependencies = ObjectUtils.toIterable(this.dependencyInjector.getAll());
    var validationService:ValidationService = this.dependencyInjector.get('validationService');
    for (let instance of dependencies) {
      if (instance.value.__$resource) {
        validationService.addSchema(instance.value.__$resource);
        // delete instance.value.__proto__.__$resource;
      }
    }
  }

}

