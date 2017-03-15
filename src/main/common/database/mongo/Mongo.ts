'use strict';
import {MongoClient} from "mongodb";
import {Service} from "node-boot";
import {Config} from "../../../config/Config";

const jsonutils = require("jsonutils");

@Service
export class Mongo {
  private connection;

  constructor(private config: Config) {
  }

  private setOption(obj, path, value) {
    let existentValue = jsonutils.get(obj, path);
    if (!existentValue === null) {
      jsonutils.set(obj, path, value, true);
    }
  }

  private getCredentialsString(databaseConfig): string {
    let credentials = '';
    if (databaseConfig.username && databaseConfig.password) {
      credentials = databaseConfig.username + ':' + databaseConfig.password + '@';
    }
    return credentials;
  }

  private getConnectionString(databaseConfig) {
    const host = databaseConfig.host || 'localhost';
    const port = databaseConfig.port || 27017;

    return `mongodb://${this.getCredentialsString(databaseConfig)}${host}:${port}/${databaseConfig.database}`;
  }

  public getConnection() {
    return this.connection;
  }

  public async connect(options?: Object): Promise<any> {
    if (this.connection) {
      return this.connection;
    }

    const databaseConfig = this.config.database;

    options = options || {};
    this.setOption(options, 'server.pool', 10);

    this.connection = await MongoClient.connect(this.getConnectionString(databaseConfig), options)
    console.log("Connected to Mongo DB.");
    return this.connection;
  }

}