'use strict';
import {Inject} from "../common/decorators/inject";
import {Collection} from "../common/enums/collection";
import {Db} from "mongodb";
import {User} from "./user";
import {BaseDao} from "../common/dao/baseDao";

@Inject()
export class UserDao extends BaseDao {
  constructor(private database:Db) {
    super(database, Collection.USER);
  }

  public findOneByEmail(email:string):Promise<User> {
    var query = {
      email: email
    };
    return this.findOne(query);
  }
}

