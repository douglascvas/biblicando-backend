'use strict';
import {Inject} from "../common/decorators/inject";
import {Collection} from "../common/enums/collection";
import {BaseDao} from "../common/dao/baseDao";
import {Chapter} from "./chapter";
import {ObjectID, Db} from "mongodb";

@Inject
export class ChapterDao extends BaseDao<Chapter> {

  constructor(private database: Db) {
    super(database, Collection.CHAPTER);
  }

  public findByBook(bookId: string): Promise<Chapter[]> {
    const query = {
      "book._id": bookId
    };
    return this.find(query, {});
  }

  public upsertOne(chapter: Chapter): Promise<Chapter> {
    const self = this;
    let queries = [];
    if (chapter._id) {
      queries.push({_id: ObjectID.createFromHexString(chapter._id)});
    }
    if (chapter.remoteId) {
      queries.push({remoteId: chapter.remoteId});
    }
    let query: any = (queries.length > 1 ? {$or: queries} : queries[0]);
    if (query) {
      return self.updateOne(query, chapter, {upsert: true});
    } else {
      return self.insertOne(chapter);
    }
  }
}