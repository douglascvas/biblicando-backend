import {Config} from "../main/config/Config";
import {ConfigDev} from "../main/config/ConfigDev";
import {TestLoggerFactory} from "./unit/common/TestLoggerFactory";

const Configurator = require("configurator-js");
const moduleInfo = require("../../package.json");

function createConfig(): Config {
  return new ConfigDev();
}

let config = createConfig();

export class TestUtils {
  public static buildLoggerFactory() {
    return new TestLoggerFactory();
  }
}