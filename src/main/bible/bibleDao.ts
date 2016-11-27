'use strict';

import {BaseDao} from "../common/dao/baseDao";
import {Inject} from "../common/decorators/inject";
import {Collection} from "../common/enums/collection";
import {Bible} from "./bible";
import {Db} from "mongodb";
import {Optional} from "../common/optional";

@Inject
export class BibleDao extends BaseDao<Bible> {

  constructor(private database: Db) {
    super(database, Collection.BIBLE);
  }

  public findOneByName(name: string): Promise<Optional<Bible>> {
    const query = {
      name: name
    };
    return this.findOne(query)
      .then(value => value !== undefined ? value : null);
  }

  public insertBible(bible: Bible): Promise<Bible> {
    bible.updatedAt = new Date();

    return this.insertOne(bible);
  }

  public updateRemoteBible(bible: Bible): Promise<Bible> {
    const query = {
      remoteSource: bible.remoteSource,
      remoteId: bible.remoteId
    };
    bible.updatedAt = new Date();

    return this.updateOne(query, {$set: bible}, {upsert: true});
  }

  public async findRemoteBible(bible: Bible): Promise<Optional<Bible>> {
    const query = {
      remoteSource: bible.remoteSource,
      remoteId: bible.remoteId
    };

    return this.findOne(query);
  }
}