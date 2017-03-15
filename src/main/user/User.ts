'use strict';
import {Permission} from "./Permission";
import {Resource} from "../common/decorators/Resource";
import {Type} from "../common/decorators/Type";
import {SchemaType} from "../common/enums/SchemaType";

@Resource
export class User {

  @Type(SchemaType.STRING)
  firstName:string;

  @Type(SchemaType.STRING)
  lastName:string;

  @Type(SchemaType.STRING)
  passwordHash:string;

  @Type(SchemaType.STRING)
  passwordAlgorithm:string;

  @Type(SchemaType.STRING)
  passwordSalt:string;

  @Type(SchemaType.STRING)
  email:string;

  @Type(SchemaType.STRING)
  registrationIP:string;

  @Type(SchemaType.ARRAY, Permission)
  permissions:Permission[];
}