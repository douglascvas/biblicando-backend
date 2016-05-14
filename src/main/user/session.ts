'use strict';
import {User} from "./user";
import {Resource} from "../common/decorators/resource";
import {Type} from "../common/decorators/type";
import {SchemaType} from "../common/enums/schemaType";

@Resource
export class Session {

  @Type(SchemaType.OBJECT, User)
  user:User;

  @Type(SchemaType.OBJECT, Date)
  date:Date;
}