import {Config} from "../main/common/config";
import * as path from "path";
import {LoggerFactory} from "node-boot";

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");

function createConfig(): Config {
  const CONFIG_PATH = path.resolve(process.env.CONFIG_PATH || __dirname + "/config.yml");
  const configurator = new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
  return new Config(configurator);
}

let config = createConfig();

export class TestUtils {
  public static buildLoggerFactory() {
    return new LoggerFactory(config);
  }
}