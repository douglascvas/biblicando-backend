import {Config} from "./config";
import * as express from "express";
import {ModuleScannerService} from "./service/moduleScannerService";
import {LoggerFactory} from "./loggerFactory";
import {DependencyInjector} from "./service/dependencyInjector";
import {Server} from "../server";

const path = require("path");
const Configurator = require("configurator-js");
const moduleInfo = require("../../../package.json");

export class ServerFactory {
  public createServer(app?): Server {
    app = app || express();
    var config: Config = this.loadConfiguration();
    var moduleScannerService = new ModuleScannerService();
    var loggerFactory = new LoggerFactory(config);
    var dependencyInjector = new DependencyInjector(loggerFactory);
    return new Server(app, config, dependencyInjector, loggerFactory, moduleScannerService);
  }

  private loadConfiguration(): Config {
    const CONFIG_PATH = path.resolve(process.env.CONFIG_PATH || __dirname + "/../../resource/config.yml");
    console.log("Loading configuration from ", CONFIG_PATH);
    var configurator = new Configurator(CONFIG_PATH, moduleInfo.name, moduleInfo.version);
    return new Config(configurator);
  }
}