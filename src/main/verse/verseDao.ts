'use strict';
import {Inject} from "../common/decorators/inject";
import {Db} from "mongodb";
import {BaseDao} from "../common/dao/baseDao";
import {Collection} from "../common/enums/collection";
import {Verse} from "./verse";
import {Optional} from "../common/optional";

@Inject
export class VerseDao extends BaseDao<Verse> {
  constructor(private database: Db) {
    super(database, Collection.VERSE);
  }

  public findOneByNumber(chapterId: string, number: number): Promise<Optional<Verse>> {
    const query = {
      "chapter._id": chapterId,
      "number": number
    };
    return this.findOne(query);
  }

  public findByChapter(chapterId: string, options?: any): Promise<Verse[]> {
    const query = {
      "chapter._id": chapterId
    };
    return this.find(query, options);
  }
}
