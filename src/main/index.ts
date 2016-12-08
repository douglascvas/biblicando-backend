import {ApplicationManager} from "./bdi/applicationManager";
import {Server} from "./server";
import * as path from "path";
import {Config} from "./common/config";
import {LoggerFactory} from "./common/loggerFactory";
import * as express from "express";
import {IRouter} from "express-serve-static-core";
import {RouteManager} from "./bdi/routeManager/routeManager";
import {ExpressRouterManager} from "./bdi/routeManager/expressRouteManager";

const Configurator = require("configurator-js");
const moduleInfo = require("../../../package.json");

function createConfig(): Config {
  const CONFIG_PATH = path.resolve(process.env.CONFIG_PATH || __dirname + "/../resource/config.yml");
  console.log("Loading configuration from ", CONFIG_PATH);
  const configurator = new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
  return new Config(configurator);
}

async function start() {
  const config: Config = createConfig();
  const loggerFactory: LoggerFactory = new LoggerFactory(config);
  const app: any = express();
  const router: IRouter = express.Router();
  const routerManager: RouteManager = new ExpressRouterManager(router, loggerFactory);

  const applicationManager: ApplicationManager = new ApplicationManager(Server, routerManager, loggerFactory);
  applicationManager.registerValue('config', config);
  applicationManager.registerValue('app', app);
  applicationManager.registerValue('router', router);
  applicationManager.registerValue('loggerFactory', loggerFactory);

  let server: Server = await applicationManager.bootstrap();
  try {
    await server.initialize();
    await server.start();
  } catch (e) {
    server.logger.error(e.stack);
  }
}

start();
