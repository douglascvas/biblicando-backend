'use strict';
import {Named} from "../bdi/decorator/di";
import {Collection} from "../common/enums/collection";
import {Db} from "mongodb";
import {User} from "./user";
import {BaseDao} from "../common/dao/baseDao";
import {Optional} from "../common/optional";

@Named
export class UserDao extends BaseDao<User> {
  constructor(private database: Db) {
    super(database, Collection.USER);
  }

  public findOneByEmail(email: string): Promise<Optional<User>> {
    const query = {
      email: email
    };
    return this.findOne(query);
  }
}

