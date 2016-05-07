'use strict';

import {BaseDao} from "../common/dao/baseDao";
import {Inject} from "../common/decorators/inject";
import {Collection} from "../common/enums/collection";
import {Bible} from "./bible";
import {Db} from "mongodb";
import {UpdateWriteOpResult} from "mongodb";
import IPromise = Q.IPromise;

@Inject()
export class BibleDao extends BaseDao<Bible> {

  constructor(private database:Db) {
    super(database, Collection.BIBLE);
  }

  public findOneByName(name:string):IPromise<Bible> {
    var query = {
      name: name
    };
    return this.findOne(query);
  }

  public updateRemoteBible(bible:Bible):IPromise<UpdateWriteOpResult> {
    var query = {
      remoteSource: bible.remoteSource,
      remoteId: bible.remoteId
    };

    return this.updateOne(query, bible, {upsert: true});
  }
}