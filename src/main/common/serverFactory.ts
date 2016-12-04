import {Config} from "./config";
import * as express from "express";
import {LoggerFactory} from "./loggerFactory";
import {Server} from "../server";

const path = require("path");
const Configurator = require("configurator-js");
const moduleInfo = require("../../../package.json");

export class ServerFactory {
  public createServer(app?): Server {
    app = app || express();
    const config: Config = this.loadConfiguration();
    const loggerFactory = new LoggerFactory(config);
    return new Server(app, config, loggerFactory);
  }

  private loadConfiguration(): Config {
    const CONFIG_PATH = path.resolve(process.env.CONFIG_PATH || __dirname + "/../../resource/config.yml");
    console.log("Loading configuration from ", CONFIG_PATH);
    const configurator = new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
    return new Config(configurator);
  }
}