'use strict';
import {Inject} from "../common/decorators/inject";
import {Promise} from "../common/interface/promise";
import {Collection} from "../common/enums/collection";
import {BaseDao} from "../common/dao/baseDao";
import {Chapter} from "./chapter";
import {ObjectID, Db} from "mongodb";
import {InsertOneWriteOpResult} from "mongodb";

@Inject
export class ChapterDao extends BaseDao<Chapter> {

  constructor(private database:Db) {
    super(database, Collection.CHAPTER);
  }

  public findByBook(bookId:string):Promise<Chapter[]> {
    var query = {
      "book._id": bookId
    };
    return this.find(query, {});
  }

  public upsertOne(chapter:Chapter):Promise<Chapter> {
    var self = this;
    let queries = [];
    if (chapter._id) {
      queries.push({_id: ObjectID.createFromHexString(chapter._id)});
    }
    if (chapter.remoteId) {
      queries.push({remoteId: chapter.remoteId});
    }
    let query = (queries.length > 1 ? {$or: queries} : queries[0]);
    var result;
    if (query) {
      result = self.updateOne(query, chapter, {upsert: true})
        .then(()=>self.findOne(query));
    } else {
      result = self.insertOne(chapter)
        .then((inserted:InsertOneWriteOpResult)=>self.findOne({_id: inserted.insertedId}));
    }
    return result;
  }
}