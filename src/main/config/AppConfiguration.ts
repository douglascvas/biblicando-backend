'use strict';

import {Produces} from "../bdi/decorator/di";
import * as express from "express";
import {Config} from "../common/config";
import {Mongo} from "../common/database/mongo/mongo";

export class AppConfiguration {
  @Produces('database')
  private async databaseFactory(config: Config) {
    const mongoDb: Mongo = new Mongo(config);
    const connection = await mongoDb.connect();
    return connection;
  }
}