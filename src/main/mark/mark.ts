'use strict';
import {Verse} from "../verse/verse";
import {User} from "../user/user";
import {Resource} from "../common/decorators/resource";
import {Type} from "../common/decorators/type";
import {SchemaType} from "../common/enums/schemaType";

@Resource
export class Mark {

  @Type(SchemaType.STRING)
  _id:string;

  @Type(SchemaType.OBJECT, Verse)
  verse:Verse;

  @Type(SchemaType.STRING)
  text:string;

  @Type(SchemaType.NUMBER)
  startIndex:number;

  @Type(SchemaType.NUMBER)
  endIndex:number;

  @Type(SchemaType.STRING)
  contentHash:string;

  @Type(SchemaType.OBJECT, User)
  user:User;

  @Type(SchemaType.ARRAY, String)
  attributes:string[];

  @Type(SchemaType.STRING)
  tags:string;

  @Type(SchemaType.OBJECT)
  insertDate:Date
}