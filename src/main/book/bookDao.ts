'use strict';
import {Named} from "../bdi/decorator/di";
import {BaseDao} from "../common/dao/baseDao";
import {ObjectID, InsertOneWriteOpResult} from "mongodb";
import {Collection} from "../common/enums/collection";
import {Book} from "./book";
import {Optional} from "../common/optional";

@Named
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
