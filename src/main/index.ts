import * as express from "express";
import {ApplicationManager, LoggerFactory, WebManager, ExpressWebManager} from "node-boot";
import {BiblicandoLoggerFactory} from "./common/LoggerFactory";
import * as sourceMapSupport from "source-map-support";
import {Config} from "./config/Config";
import {ConfigDev} from "./config/ConfigDev";
import {ConfigProd} from "./config/ConfigProd";
import {Server} from "./Server";

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");

sourceMapSupport.install();

async function start() {
  const devMode: boolean = (process.env.NODE_ENV === 'development');
  const config: Config = devMode ? new ConfigDev() : new ConfigProd();
  const loggerFactory: LoggerFactory = new BiblicandoLoggerFactory(config);
  const app: any = express();
  const webManager: WebManager = new ExpressWebManager(app, loggerFactory);

  const applicationManager: ApplicationManager = new ApplicationManager(Server, webManager, loggerFactory);
  applicationManager.registerValue('config', config);
  applicationManager.registerValue('app', app);
  applicationManager.registerValue('router', express.Router());
  applicationManager.registerValue('loggerFactory', loggerFactory);

  let server: Server = await applicationManager.bootstrap();
  await server.initialize();
  await server.start();
}

process.on('unhandledRejection', (reason) => {
  console.log('Reason: ' + reason);
});

try {
  start()
    .catch(e => console.trace(e));
} catch (e) {
  console.trace(e.stack);
}


