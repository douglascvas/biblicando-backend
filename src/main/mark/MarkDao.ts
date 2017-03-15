'use strict';
import {BaseDao} from "../common/dao/BaseDao";
import {Collection} from "../common/enums/Collection";
import {Mark} from "./Mark";
import {ObjectID} from "mongodb";
import * as assert from "assert";
import {Optional, Service} from "node-boot";

@Service
export class MarkDao extends BaseDao<Mark> {
  constructor(private database) {
    super(database, Collection.MARK);
  }

  public findFromVerses(userId: string, verseIds: string[]): Promise<Mark[]> {
    assert(userId);
    assert(verseIds);

    const query = {
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
  public removeFromVerses(userId: string, verseIds: string[], insertDateToIgnore: Date) {
    insertDateToIgnore = insertDateToIgnore || null;
    assert(userId);
    assert(verseIds);

    const query: any = {
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

  public findOneById(userId: string, markId: string): Promise<Mark> {
    assert(userId);
    assert(markId);

    const query = {
      "_id": ObjectID.createFromHexString(markId),
      "user._id": ObjectID.createFromHexString(userId)
    };

    return this.findOne(query);
  }

  public findByVerse(userId: string, verseId: ObjectID, options: any): Promise<Mark[]> {
    assert(userId);
    assert(verseId);

    const query = {
      "user._id": ObjectID.createFromHexString(userId),
      "verse._id": verseId
    };

    return this.find(query, options);
  }

  public findByTag(userId: string, tags: string[]): Promise<Mark[]> {
    assert(userId);
    assert(tags);

    const query = {
      "user._id": ObjectID.createFromHexString(userId),
      "tag": {
        $in: tags
      }
    };

    return this.find(query);
  }
}