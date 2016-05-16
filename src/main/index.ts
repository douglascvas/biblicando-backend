import {Server} from './server';
import {DependencyInjector} from "./common/service/dependencyInjector";
import {LoggerFactory} from "./common/loggerFactory";
import {ModuleScannerService} from "./common/service/moduleScannerService";

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");

const CONFIG_PATH = process.env.CONFIG_PATH || __dirname + "/resources/config.yml";

function loadConfiguration() {
  console.log("Loading configuration from ", CONFIG_PATH);
  return new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
}

var config = loadConfiguration();
var moduleScannerService = new ModuleScannerService();
var loggerFactory = new LoggerFactory(config);
var logger = loggerFactory.getLogger('Biblicando');
var dependencyInjector = new DependencyInjector(loggerFactory);
var server = new Server(config, dependencyInjector, loggerFactory, moduleScannerService);
server.initialize(true)
  .catch(e => {
    logger.error(e.stack);
  });