'use strict';
import * as bla from 'source-map-support';
bla.install();
// require('source-map-support').install();

import {DependencyInjector} from "./common/service/dependencyInjector";
import {RedisClient} from "./common/cache/redisClient";
import {Logger} from "./common/logger";
import {ObjectUtils} from "./common/service/objectUtils";
import {Mongo} from "./common/database/mongo/mongo";
import * as express from "express";
import * as request from "request-promise";
import * as bodyParser from "body-parser";

const Configurator = require("configurator-js");
const moduleInfo =require("../package.json");
const requireDir = require("require-dir");

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
    var classes = requireDir('.');
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

console.log("test");
var server = new Server();
server.initialize();

// 'use strict';
//
// // stack trace is working with ts files fine with source-map-support npm package used
// import 'source-map-support/register';
//
// // relative path thanks to symlink(for runtime) and moduleReferencing: classic (for tsc/IDE)
// // import foo from 'src/main/foo/foo';
//
// // to import whole module from node_modules use "import * as ... from '...'" - it's transpiled to "var ... = require('...');
// // importing default export via: import ... from '...' won't work because then '.default' is applied to all usages
// // of imported node_module. Importing node_module which has named exports can be imported with
// // "import { namedExport1, namedExport2 } from '...'" etc.
// import * as chalk from 'chalk';
// console.log(chalk.bold.red('chalked'));
//
// // works even with functions as default exports
// import * as moment from 'moment';
// console.log(moment());
//
// // example why default import won't work:
// // second of this two lines would result in a "TypeError: moment_1.default is not a function"
// // import moment1 from 'moment';
// // console.log(moment1());
//
// // foo();
//
// // no cycle reference even when using ambient declarations placed inside symlinked dir
// class World implements ICanHello {
//   constructor () {
//     console.log('constructor');
//   }
//   public hello () {
//     console.log('hello u');
//   }
// }
//
// // debugging is done through ts code correctly
// console.log('before new World');
// let world = new World();
// console.log('after new World');
// throw new Error('error a - stack trace is working with ts files fine with source-map-support');
// world.hello();
// console.log('after hello');