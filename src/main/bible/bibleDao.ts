'use strict';

import {BaseDao} from "../common/dao/baseDao";
import {Inject} from "../common/decorators/inject";
import {Collection} from "../common/enums/collection";
import {Bible} from "./bible";
import {Db} from "mongodb";
import {UpdateWriteOpResult} from "mongodb";
import {Promise} from "../common/interface/promise";

@Inject
export class BibleDao extends BaseDao<Bible> {

  constructor(private database:Db) {
    super(database, Collection.BIBLE);
  }

  public findOneByName(name:string):Promise<Bible> {
    var query = {
      name: name
    };
    return this.findOne(query)
      .then(value => value !== undefined ? value : null);
  }

  public updateRemoteBible(bible:Bible):Promise<UpdateWriteOpResult> {
    var query = {
      remoteSource: bible.remoteSource,
      remoteId: bible.remoteId
    };

    return this.updateOne(query, bible, {upsert: true});
  }
}