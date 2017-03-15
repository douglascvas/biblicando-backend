'use strict';
import {User} from "./User";
import {Resource} from "../common/decorators/Resource";
import {Type} from "../common/decorators/Type";
import {SchemaType} from "../common/enums/SchemaType";

@Resource
export class Session {

  @Type(SchemaType.OBJECT, User)
  user:User;

  @Type(SchemaType.OBJECT, Date)
  date:Date;
}