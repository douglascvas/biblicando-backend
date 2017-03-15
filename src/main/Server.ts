'use strict';
// Maps the stack trace to the right typescript sources
import * as sourceMapSupport from "source-map-support";
import * as bodyParser from "body-parser";
import {Mongo} from "./common/database/mongo/Mongo";
import {AutoScan, Logger, LoggerFactory, Factory} from "node-boot";
import {IRouter} from "express-serve-static-core";
import {Config} from "./config/Config";

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

  private listen(): Promise<any> {
    const self = this;
    return new Promise((resolve) => {
      self.app.listen(this.config.server.port, () => {
        self.logger.info(`Listening on port ${this.config.server.port}`);
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

  @Factory('database')
  private async databaseFactory(config: Config) {
    const mongoDb: Mongo = new Mongo(config);
    const connection = await mongoDb.connect();
    return connection;
  }

}

