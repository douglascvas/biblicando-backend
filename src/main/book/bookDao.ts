namespace book {
  'use strict';

  import mongodb = require('mongodb');
  import Inject = common.Inject;
  import BaseDao = common.BaseDao;
  import Collection = common.Collection;

  const ObjectID = mongodb.ObjectID;

  @Inject
  export class BookDao extends BaseDao {

    constructor(private database) {
      super(database, Collection.BOOK);
    }

    public upsertOne(book) {
      let queries = [];
      if (book._id) {
        queries.push({_id: ObjectID.createFromHexString(book._id)});
      }
      if (book.remoteId) {
        queries.push({remoteId: book.remoteId});
      }
      let query = (queries.length > 1 ? {$or: queries} : queries[0]);
      if (query) {
        this.updateOne(query, book, {upsert: true});
      } else {
        this.insertOne(book);
      }
    }

    public findOneByName(name) {
      var query = {
        name: name
      };
      return this.findOne(query);
    }

    public findByBible(bibleId) {
      var query = {
        "bible.id": bibleId
      };
      return this.find(query, {});
    }
  }

  module.exports = BookDao;

}