'use strict';
// Maps the stack trace to the right typescript sources
require('source-map-support').install();

import {DependencyInjector} from "./common/service/dependencyInjector";
import {RedisClient} from "./common/cache/redisClient";
import {Logger} from "./common/logger";
import {ObjectUtils} from "./common/service/objectUtils";
import {Mongo} from "./common/database/mongo/mongo";
import * as express from "express";
import * as request from "request-promise";
import * as bodyParser from "body-parser";

const requireDir = require("require-dir-all");
const Configurator = require("configurator-js");
const moduleInfo = require("../package.json");


const CONFIG_PATH = process.env.CONFIG_PATH || __dirname + "/resources/config.yml";

export class Server {
  private doNotRegister = ['RedisClient'];
  private globalLogger;
  private logger;

  private createServer() {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    return app;
  }

  private loadConfiguration() {
    console.log("Loading configuration from ", CONFIG_PATH);
    return new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
  }

  private registerServices(dependencyInjector) {
    var self = this;
    var classes = requireDir('.', {
      recursive: true,
      map: (mod) => {
        Object.keys(mod.exports).forEach(key => {
          if (mod.exports.hasOwnProperty(key)) {
            let classz = mod.exports[key];
            if (typeof classz === 'function' && self.doNotRegister.indexOf(key) < 0) {
              dependencyInjector.service(classz);
            } else {
              self.logger.debug(`Skipping registration of ${key}. Not a function/class.`);
            }
          }
        });
      }
    });
  }

  private startServer(app, config) {
    var serverConfig = config.get('server');
    app.listen(serverConfig.port, function () {
      console.log(`Listening on port ${serverConfig.port}`);
    });
  }

  private loggerProxy(className, value) {
    return value.getLogger(className);
  }

  private registerOthers(dependencyInjector:DependencyInjector) {
    dependencyInjector.service(RedisClient, 'cacheClient');
    dependencyInjector.service(Logger);
    dependencyInjector.hookInjection('logger', this.loggerProxy.bind(this));
  }

  public initialize() {
    var self = this;
    const objectUtils:ObjectUtils = new ObjectUtils();
    const config = self.loadConfiguration();
    const mongoDb:Mongo = new Mongo(config);
    return mongoDb.connect()
      .then(connection => {
        var app = this.createServer();
        self.globalLogger = new Logger(config);
        self.logger = self.globalLogger.getLogger("server.js");
        const dependencyInjectorLogger = self.globalLogger.getLogger("dependencyInjector.js");
        const dependencyInjector:DependencyInjector = new DependencyInjector(objectUtils, dependencyInjectorLogger);
        self.registerServices(dependencyInjector);
        self.registerOthers(dependencyInjector);
        dependencyInjector.value('logger', self.globalLogger);
        dependencyInjector.value('config', config);
        dependencyInjector.value('router', app);
        dependencyInjector.value('httpClient', request);
        dependencyInjector.value('database', connection);
        dependencyInjector.build();
        dependencyInjector.getAll().forEach(instance => {
          if (typeof instance.value.$controller === 'function') {
            const controllerLogger = self.globalLogger.getLogger(`${instance.name}.js`);
            instance.value.$controller(app, controllerLogger);
          }
        });
        self.startServer(app, config);
      })
      .catch(e => {
        console.log(e.stack);
      });
  }

}

var server = new Server();
server.initialize();
