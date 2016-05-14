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
import * as express from "express";
import * as request from "request-promise";
import * as bodyParser from "body-parser";

export class Server {
  private logger;

  constructor(private config,
              private dependencyInjector:DependencyInjector,
              private loggerFactory:LoggerFactory,
              private moduleScannerService:ModuleScannerService) {
    this.logger = loggerFactory.getLogger("server");
  }

  private createServer() {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    return app;
  }

  private startServer(app, config):any {
    var self = this;
    var serverConfig = config.get('server');
    return app.listen(serverConfig.port, function () {
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
        var app = this.createServer();
        self.registerDependencies(self.dependencyInjector, self.config, app, connection);
        self.registerApis(self.dependencyInjector);
        self.registerSchemas(self.dependencyInjector);
        return self.startServer(app, self.config);
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
      if (!instance.value.$controller) {
        continue;
      }
      if (typeof instance.value.$controller.register !== 'function') {
        throw new Error(`The controller ${instance.name} must be annotated with @Controller`)
      }
      instance.value.$controller.register(app, this.loggerFactory);
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
        validationService.addSchema(instance.value.$resource);
      }
    }
  }

}

