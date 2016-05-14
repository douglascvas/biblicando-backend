'use strict';
import {Inject} from "../common/decorators/inject";
import {Collection} from "../common/enums/collection";
import {Db} from "mongodb";
import {User} from "./user";
import {BaseDao} from "../common/dao/baseDao";
import IPromise = Q.IPromise;

@Inject
export class UserDao extends BaseDao<User> {
  constructor(private database:Db) {
    super(database, Collection.USER);
  }

  public findOneByEmail(email:string):IPromise<User> {
    var query = {
      email: email
    };
    return this.findOne(query);
  }
}

