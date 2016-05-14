'use strict';
// Maps the stack trace to the right typescript sources
require('source-map-support').install();

import {ModuleScannerService} from "./common/service/moduleScannerService";
import {ValidationService} from "./common/service/validationService";
import {DependencyInjector} from "./common/service/dependencyInjector";
import {LoggerFactory} from "./common/loggerFactory";
import {ObjectUtils} from "./common/service/objectUtils";
import {Mongo} from "./common/database/mongo/mongo";
import * as express from "express";
import * as request from "request-promise";
import * as bodyParser from "body-parser";

export class Server {
  private logger;
  private loggerFactory;
  private moduleScannerService:ModuleScannerService;
  private dependencyInjector:DependencyInjector;

  constructor(config) {
    this.moduleScannerService = new ModuleScannerService();
    this.loggerFactory = new LoggerFactory(config);
    this.logger = this.loggerFactory.getLogger("server");
    this.dependencyInjector = new DependencyInjector(this.loggerFactory);
    this.initialize(config);
  }

  private createServer() {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    return app;
  }

  private startServer(app, config) {
    var self = this;
    var serverConfig = config.get('server');
    app.listen(serverConfig.port, function () {
      self.logger.info(`Listening on port ${serverConfig.port}`);
    });
  }

  private registerServices(dependencyInjector) {
    var serviceEntries = this.moduleScannerService.getServices();
    for (let entry of serviceEntries) {
      dependencyInjector.service(entry.value);
    }
  }

  private initialize(config) {
    var self = this;
    const mongoDb:Mongo = new Mongo(config);
    return mongoDb.connect()
      .then(connection => {
        var app = this.createServer();
        self.registerDependencies(self.dependencyInjector, config, app, connection);
        self.registerApis(self.dependencyInjector);
        self.registerSchemas(self.dependencyInjector);
        self.startServer(app, config);
      })
      .catch(e => {
        self.logger.error(e.stack);
      });
  }

  private registerDependencies(dependencyInjector:DependencyInjector, config:any, app:any, connection:any) {
    this.registerServices(dependencyInjector);
    dependencyInjector.rename('redisClient', 'cacheClient');
    dependencyInjector.value('config', config);
    dependencyInjector.value('router', app);
    dependencyInjector.value('httpClient', request);
    dependencyInjector.value('database', connection);
    dependencyInjector.build();
    return dependencyInjector;
  }

  /**
   * Activate the APIs registered by the controllers.
   */
  private registerApis(dependencyInjector) {
    var dependencies = ObjectUtils.toIterable(dependencyInjector.getAll());
    var app = dependencyInjector.get('router');
    for (let instance of dependencies) {
      if (typeof instance.value.$controller === 'function') {
        const controllerLogger = this.loggerFactory.getLogger(`${instance.name}`);
        instance.value.$controller(app, controllerLogger);
      }
    }
  }

  /**
   * Register the generated schemas in the validator.
   */
  private registerSchemas(dependencyInjector) {
    var dependencies = ObjectUtils.toIterable(dependencyInjector.getAll());
    var validationService:ValidationService = dependencyInjector.get('validationService');
    for (let instance of dependencies) {
      if (instance.value.$resource) {
        this.logger.debug(`Registering resource ${instance.value.$resource.id}`);
        validationService.addSchema(instance.value.$resource);
      }
    }
  }

}

