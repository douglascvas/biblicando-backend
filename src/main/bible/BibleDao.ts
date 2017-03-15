'use strict';

import {BaseDao} from "../common/dao/BaseDao";
import {Collection} from "../common/enums/Collection";
import {Bible} from "./Bible";
import {Service} from "node-boot";

@Service
export class BibleDao extends BaseDao<Bible> {

  constructor(private database: any) {
    super(database, Collection.BIBLE);
  }

  public async findOneByName(name: string): Promise<Bible> {
    const query = {
      name: name
    };
    return await this.findOne(query);
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

  public async findRemoteBible(bible: Bible): Promise<Bible> {
    const query = {
      remoteSource: bible.remoteSource,
      remoteId: bible.remoteId
    };

    return this.findOne(query);
  }
}