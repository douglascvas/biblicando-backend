'use strict';
// Maps the stack trace to the right typescript sources
import * as sourceMapSupport from "source-map-support";
import {LoggerFactory, Logger} from "./common/loggerFactory";
import * as bodyParser from "body-parser";
import {Config} from "./common/config";
import {AutoScan} from "./bdi/decorator/di";
import {IRouter} from "express-serve-static-core";

sourceMapSupport.install();

@AutoScan(`${__dirname}/**/*.js`)
export class Server {
  private _logger: Logger;

  constructor(private app,
              private config: Config,
              private router: IRouter,
              private loggerFactory: LoggerFactory) {
    this._logger = loggerFactory.getLogger(Server);
  }

  public get logger() {
    return this._logger;
  }

  private configureServer() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: true}));
  }

  private listen(): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      const serverConfig = self.config.find('server');
      self.app.listen(serverConfig.port, () => {
        self.logger.info(`Listening on port ${serverConfig.port}`);
        resolve();
      });
    });
  }

  public async start(): Promise<any> {
    await this.initialize();
    await this.listen();
  }

  public async initialize(): Promise<any> {
    this.configureServer();
    this.app.use('/api/v1', this.router);
  }

}

