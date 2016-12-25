import {Server} from "./server";
import * as path from "path";
import {Config} from "./common/config";
import * as express from "express";
import {ApplicationManager, LoggerFactory, WebManager, ExpressWebManager} from "node-boot";
import {BiblicandoLoggerFactory} from "./common/loggerFactory";

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");

function createConfig(): Config {
  const CONFIG_PATH = path.resolve(process.env.CONFIG_PATH || __dirname + "/../resource/config.yml");
  const configurator = new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
  return new Config(configurator);
}

async function start() {
  const config: Config = createConfig();
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


