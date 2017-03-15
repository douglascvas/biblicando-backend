'use strict';
import {Collection} from "../common/enums/Collection";
import {User} from "./User";
import {BaseDao} from "../common/dao/BaseDao";
import {Service} from "node-boot";

@Service
export class UserDao extends BaseDao<User> {
  constructor(private database: any) {
    super(database, Collection.USER);
  }

  public findOneByEmail(email: string): Promise<User> {
    const query = {
      email: email
    };
    return this.findOne(query);
  }
}

