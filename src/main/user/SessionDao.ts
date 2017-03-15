'use strict';
import {BaseDao} from "../common/dao/BaseDao";
import {Collection} from "../common/enums/Collection";
import {Session} from "./Session";

export class SessionDao extends BaseDao<Session> {
  constructor(private database) {
    super(database, Collection.SESSION);
  }

  public removeOne(token) {
    var query = {
      token: token
    };
    let collection = <any>this.database.collection(Collection.SESSION);
    return collection.removeOne(query);
  }

  public findOneByToken(token) {
    var query = {
      token: token
    };
    let collection = this.database.collection(Collection.SESSION);
    return collection.find(query).limit(1).toArray();
  }
}