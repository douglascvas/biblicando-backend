'use strict';
import {User} from "./user";

export interface Session {
  user:User;
  date:Date;
}