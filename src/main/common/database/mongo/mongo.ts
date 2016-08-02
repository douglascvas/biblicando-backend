'use strict';
import {Inject} from "../../decorators/inject";
import {MongoClient} from "mongodb";
import {Config} from "../../config";

const jsonutils = require("jsonutils");

@Inject
export class Mongo {
  private connection;

  constructor(private config:Config) {
  }

  private setOption(obj, path, value) {
    var existentValue = jsonutils.get(obj, path);
    if (!existentValue === null) {
      jsonutils.set(obj, path, value, true);
    }
  }

  private getCredentialsString(databaseConfig):string {
    let credentials = '';
    if (databaseConfig.username && databaseConfig.password) {
      credentials = databaseConfig.username + ':' + databaseConfig.password + '@';
    }
    return credentials;
  }

  private getConnectionString(databaseConfig) {
    var host = databaseConfig.host || 'localhost';
    var port = databaseConfig.port || 27017;

    return `mongodb://${this.getCredentialsString(databaseConfig)}${host}:${port}/${databaseConfig.database}`;
  }

  public getConnection() {
    return this.connection;
  }

  public connect(options?:Object) {
    const self = this;

    if (self.connection) {
      return self.connection;
    }

    const databaseConfig = self.config.find('database');

    options = options || {};
    self.setOption(options, 'server.pool', 10);

    return MongoClient.connect(self.getConnectionString(databaseConfig), options)
      .then(dbConnection => {
        self.connection = dbConnection;
        console.log("Connected to Mongo DB.");
        return dbConnection;
      });
  }

}