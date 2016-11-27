'use strict';
import {Inject} from "../common/decorators/inject";
import {BaseDao} from "../common/dao/baseDao";
import {ObjectID, InsertOneWriteOpResult} from "mongodb";
import {Collection} from "../common/enums/collection";
import {Book} from "./book";
import {Optional} from "../common/optional";

@Inject
export class BookDao extends BaseDao<Book> {

  constructor(private database) {
    super(database, Collection.BOOK);
  }

  public findOneByName(name: string): Promise<Optional<Book>> {
    const query = {
      name: name
    };
    return this.findOne(query);
  }

  public findByBible(bibleId: string): Promise<Book[]> {
    const query = {
      "bible._id": bibleId
    };
    return this.find(query, {});
  }
}
