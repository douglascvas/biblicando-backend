'use strict';
import {Inject} from "../common/decorators/inject";
import {BaseDao} from "../common/dao/baseDao";
import {ObjectID} from "mongodb";
import {Collection} from "../common/enums/collection";
import {Book} from "./book";
import {Promise} from "../common/interface/promise";

@Inject
export class BookDao extends BaseDao<Book> {

  constructor(private database) {
    super(database, Collection.BOOK);
  }

  public upsertOne(book:Book):Promise<any> {
    let queries = [];
    if (book._id) {
      queries.push({_id: ObjectID.createFromHexString(book._id)});
    }
    if (book.remoteId) {
      queries.push({remoteId: book.remoteId});
    }
    let query = (queries.length > 1 ? {$or: queries} : queries[0]);
    if (query) {
      return this.updateOne(query, book, {upsert: true});
    } else {
      return this.insertOne(book);
    }
  }

  public findOneByName(name:string):Promise<Book> {
    var query = {
      name: name
    };
    return this.findOne(query);
  }

  public findByBible(bibleId:string):Promise<Book[]> {
    var query = {
      "bible._id": bibleId
    };
    return this.find(query, {});
  }
}
