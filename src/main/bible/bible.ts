'use strict';
import {Resource} from "../common/decorators/resource";
import {SchemaType} from "../common/enums/schemaType";
import {Type} from "../common/decorators/type";

@Resource
export class Bible extends Object {
  @Type(SchemaType.STRING)
  _id:string;

  @Type(SchemaType.STRING)
  remoteId:string;

  @Type(SchemaType.STRING)
  remoteSource:string;

  @Type(SchemaType.STRING)
  name:string;

  @Type(SchemaType.STRING)
  publisher:string;

  @Type(SchemaType.STRING)
  description:string;

  @Type(SchemaType.STRING)
  languageCode:string;

  @Type(SchemaType.STRING)
  languageCodeType:string;

  @Type(SchemaType.STRING)
  contactUrl:string;

  @Type(SchemaType.STRING)
  abbreviation:string;

  @Type(SchemaType.INTEGER)
  numberOfBooks:number;

  @Type(SchemaType.DATE)
  updatedAt:Date;

  @Type(SchemaType.STRING)
  copyright:string;
}
