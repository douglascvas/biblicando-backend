'use strict';
import {Collection} from "../common/enums/collection";
import {User} from "./user";
import {BaseDao} from "../common/dao/baseDao";
import {Optional, Service} from "node-boot";

@Service
export class UserDao extends BaseDao<User> {
  constructor(private database: any) {
    super(database, Collection.USER);
  }

  public findOneByEmail(email: string): Promise<Optional<User>> {
    const query = {
      email: email
    };
    return this.findOne(query);
  }
}

