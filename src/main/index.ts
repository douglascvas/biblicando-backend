import {Server} from './server';

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");

const CONFIG_PATH = process.env.CONFIG_PATH || __dirname + "/resources/config.yml";

function loadConfiguration() {
  console.log("Loading configuration from ", CONFIG_PATH);
  return new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
}

var config = loadConfiguration();
new Server(config);