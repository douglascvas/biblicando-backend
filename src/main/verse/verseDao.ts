'use strict';
import {Db} from "mongodb";
import {BaseDao} from "../common/dao/BaseDao";
import {Collection} from "../common/enums/Collection";
import {Verse} from "./verse";
import {Service} from "node-boot";

@Service
export class VerseDao extends BaseDao<Verse> {
  constructor(private database: Db) {
    super(database, Collection.VERSE);
  }

  public findOneByNumber(chapterId: string, number: number): Promise<Verse> {
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
