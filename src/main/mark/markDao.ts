'use strict';
import {ObjectID} from "mongodb";
import BaseDao = common.BaseDao;
import Collection = common.Collection;
import Inject = common.Inject;
import mongodb = require('mongodb');
import assert = require('assert');

@Inject
export class MarkDao extends BaseDao {
  constructor(private database) {
    super(database, Collection.MARK);
  }

  public findFromVerses(userId, verseIds) {
    assert(userId);
    assert(verseIds);

    var query = {
      "verse._id": {
        $in: verseIds
      },
      "user._id": userId
    };

    return self.find(query);
  }

  /**
   * Exclude all marks whose `insertDate` is not equal `insertDateToIgnore`.
   */
  public removeFromVerses(userId:ObjectID, verseIds:string[], insertDateToIgnore) {
    insertDateToIgnore = insertDateToIgnore || null;
    assert(userId);
    assert(verseIds);

    var query:any = {
      "verse._id": {
        $in: verseIds
      },
      "user._id": userId
    };
    if (insertDateToIgnore) {
      query.insertDate = {
        $ne: insertDateToIgnore
      }
    }

    return self.remove(query);
  }

  public findOneById(userId:ObjectID, markId:string) {
    assert(userId);
    assert(markId);

    var query = {
      "_id": ObjectID.createFromHexString(markId),
      "user._id": userId
    };

    return self.findOne(query);
  }

  public findByVerse(userId:ObjectID, verseId:ObjectID, options:any) {
    assert(userId);
    assert(verseId);

    var query = {
      "user._id": userId,
      "verse._id": verseId
    };

    return self.find(query, options);
  }

  public findByTag(userId:ObjectID, tags:string[]) {
    assert(userId);
    assert(tags);

    var query = {
      "user._id": userId,
      "tag": {
        $in: tags
      }
    };

    return self.find(query);
  }
}