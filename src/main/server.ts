'use strict';
// Maps the stack trace to the right typescript sources
import * as sourceMapSupport from "source-map-support";
import {ModuleScannerService} from "./common/service/moduleScannerService";
import {ValidationService} from "./common/service/validationService";
import {DependencyInjector} from "./common/service/dependencyInjector";
import {LoggerFactory, Logger} from "./common/loggerFactory";
import {ObjectUtils} from "./common/service/objectUtils";
import {Mongo} from "./common/database/mongo/mongo";
import * as bodyParser from "body-parser";
import * as express from "express";
import {Promise} from "./common/interface/promise";
import {Config} from "./common/config";
import {HttpClient} from "./common/httpClient";
sourceMapSupport.install();

import Process = NodeJS.Process;

const path = require("path");
const ignoreList = ['Promise'];

export class Server {
  private _logger:Logger;

  constructor(private app,
              private config:Config,
              private dependencyInjector:DependencyInjector,
              private loggerFactory:LoggerFactory,
              private moduleScannerService:ModuleScannerService) {
    this._logger = loggerFactory.getLogger(Server);
  }

  public get logger():Logger {
    return this._logger;
  }

  private configureServer() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
  }

  private listen(callback) {
    var self = this;
    const serverConfig = self.config.find('server');
    self.app.listen(serverConfig.port, function () {
      self.logger.info(`Listening on port ${serverConfig.port}`);
      callback();
    });
  }

  public start():Promise<any> {
    return new Promise((resolve, reject)=> {
      const self = this;
      self.registerApis();
      process.nextTick(()=> {
        this.listen(()=>resolve(self.app));
      });
    });
  }

  private registerServices(dependencyInjector) {
    var serviceEntries = this.moduleScannerService.getServices();
    for (let entry of serviceEntries) {
      if (ignoreList.indexOf(entry.name) < 0) {
        dependencyInjector.service(entry.value);
      }
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
    var router = express.Router();
    // router.use('/api', user);
    this.app.use('/api/v1', router);
    this.dependencyInjector.rename('redisClient', 'cacheClient');
    this.dependencyInjector.value('config', this.config);
    this.dependencyInjector.value('router', router);
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

