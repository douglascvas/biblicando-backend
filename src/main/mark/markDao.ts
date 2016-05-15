'use strict';
import {Inject} from "../common/decorators/inject";
import {BaseDao} from "../common/dao/baseDao";
import {Collection} from "../common/enums/collection";
import {Mark} from "./mark";
import {ObjectID} from "mongodb";
import * as assert from "assert";
import {Promise} from "../common/interface/promise";

@Inject
export class MarkDao extends BaseDao<Mark> {
  constructor(private database) {
    super(database, Collection.MARK);
  }

  public findFromVerses(userId:string, verseIds:string[]):Promise<Mark[]> {
    assert(userId);
    assert(verseIds);

    var query = {
      "verse._id": {
        $in: verseIds
      },
      "user._id": userId
    };

    return this.find(query);
  }

  /**
   * Exclude all marks whose `insertDate` is not equal `insertDateToIgnore`.
   */
  public removeFromVerses(userId:string, verseIds:string[], insertDateToIgnore:Date) {
    insertDateToIgnore = insertDateToIgnore || null;
    assert(userId);
    assert(verseIds);

    var query:any = {
      "verse._id": {
        $in: verseIds
      },
      "user._id": ObjectID.createFromHexString(userId)
    };
    if (insertDateToIgnore) {
      query.insertDate = {
        $ne: insertDateToIgnore
      }
    }

    return this.remove(query);
  }

  public findOneById(userId:ObjectID, markId:string):Promise<Mark> {
    assert(userId);
    assert(markId);

    var query = {
      "_id": ObjectID.createFromHexString(markId),
      "user._id": userId
    };

    return this.findOne(query);
  }

  public findByVerse(userId:ObjectID, verseId:ObjectID, options:any):Promise<Mark[]> {
    assert(userId);
    assert(verseId);

    var query = {
      "user._id": userId,
      "verse._id": verseId
    };

    return this.find(query, options);
  }

  public findByTag(userId:ObjectID, tags:string[]):Promise<Mark[]> {
    assert(userId);
    assert(tags);

    var query = {
      "user._id": userId,
      "tag": {
        $in: tags
      }
    };

    return this.find(query);
  }
}