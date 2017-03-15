'use strict';
import {BaseDao} from "../common/dao/BaseDao";
import {Collection} from "../common/enums/Collection";
import {Book} from "./Book";
import {Service} from "node-boot";

@Service
export class BookDao extends BaseDao<Book> {

  constructor(private database) {
    super(database, Collection.BOOK);
  }

  public findOneByName(name: string): Promise<Book> {
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
