'use strict';
// Maps the stack trace to the right typescript sources
import * as sourceMapSupport from "source-map-support";
import {ModuleScannerService} from "./bdi/moduleScannerService";
import {DependencyInjector} from "./bdi/dependencyInjector";
import {LoggerFactory, Logger} from "./common/loggerFactory";
import {Mongo} from "./common/database/mongo/mongo";
import * as bodyParser from "body-parser";
import * as express from "express";
import {Config} from "./common/config";
import {AppManager} from "./bdi/appManager";
import {AutoScan} from "./bdi/decorator/di";
sourceMapSupport.install();

import Process = NodeJS.Process;

const ignoreList = ['Promise'];

@AutoScan
export class Server {
  private _logger: Logger;
  private appManager: AppManager;

  constructor(private app,
              private config: Config,
              private loggerFactory: LoggerFactory) {
    this._logger = loggerFactory.getLogger(Server);
    this.appManager = new AppManager(this, loggerFactory);
  }

  public get logger() {
    return this._logger;
  }

  private configureServer() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
  }

  private listen(callback) {
    const self = this;
    const serverConfig = self.config.find('server');
    self.app.listen(serverConfig.port, function () {
      self.logger.info(`Listening on port ${serverConfig.port}`);
      callback();
    });
  }

  public start(): Promise<any> {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        this.listen(() => resolve(this.app)));
    });
  }

  public async initialize(): Promise<any> {
    const mongoDb: Mongo = new Mongo(this.config);
    const connection = await mongoDb.connect();
    this.configureServer();
    this.registerDependencies(connection);
    return this.appManager.bootstrap();
  }

  private registerDependencies(connection: any) {
    const router = express.Router();
    this.app.use('/api/v1', router);
    this.appManager.registerValue('config', this.config);
    this.appManager.registerValue('router', router);
    this.appManager.registerValue('database', connection);
  }

  /**
   * Activate the APIs registered by the controllers.
   */
  // private registerApis() {
  //   const dependencies = ObjectUtils.toIterable(this.dependencyInjector.getAll());
  //   const app = this.dependencyInjector.get('router');
  //   for (let instance of dependencies) {
  //     if (!instance.value.$controller) {
  //       continue;
  //     }
  //     if (typeof instance.value.$controller.register !== 'function') {
  //       throw new Error(`The controller ${instance.name} must be annotated with @Controller`)
  //     }
  //     instance.value.$controller.register(app, instance.value, this.loggerFactory);
  //   }
  // }

  /**
   * Register the generated schemas in the validator.
   */
  // private registerSchemas() {
  // const dependencies = ObjectUtils.toIterable(this.dependencyInjector.getAll());
  // const validationService: ValidationService = this.dependencyInjector.get('validationService');
  // for (let instance of dependencies) {
  //   if (instance.value.__$resource) {
  //     validationService.addSchema(instance.value.__$resource);
  //     // delete instance.value.__proto__.__$resource;
  //   }
  // }
  // }

}

