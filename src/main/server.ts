'use strict';

namespace common {

  import Configurator = require('configurator-js');
  import moduleInfo = require('../../../../package.json');
  import request = require('request-promise');
  // import Mongo = require('./database/mongo/mongo');
  import express = require('express');
  import bodyParser = require('body-parser');
  import requireDir = require('require-dir');
  // const serviceClasses = require('./service/index');
  // const controllerClasses = require('./api/index');
  // const daos = require('./database/mongo/dao/index');
  // const Logger = require('./others/logger');
  const CONFIG_PATH = process.env.CONFIG_PATH || __dirname + "/resources/config.yml";

  export class Server {
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

    private registerServices(builder) {
      var classes = requireDir('main');
      Reflect.ownKeys(classes).forEach(key => builder.service(classes[key]));
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
      dependencyInjector.decorate('logger', this.loggerProxy.bind(this));
    }

    public initialize() {
      var self = this;
      const objectUtils:ObjectUtils = new ObjectUtils();
      const dependencyInjector:DependencyInjector = new DependencyInjector(objectUtils);
      const config = self.loadConfiguration();
      const mongoDb:Mongo = new Mongo(config);
      return mongoDb.connect()
        .then(connection => {
          var app = this.createServer();
          self.registerServices(dependencyInjector);
          self.registerOthers(dependencyInjector);
          dependencyInjector.value('config', config);
          dependencyInjector.value('router', app);
          dependencyInjector.value('httpClient', request);
          dependencyInjector.value('database', connection);
          dependencyInjector.build();
          self.startServer(app, config);
        })
        .catch(e => {
          console.log(e.stack);
        });
    }

  }

  var server = new Server();
  server.initialize();
}