'use strict';
import {Bible} from "../bible/bible";
import {Resource} from "../common/decorators/resource";
import {SchemaType} from "../common/enums/schemaType";
import {Type} from "../common/decorators/type";

@Resource
export class Book {
  
  @Type(SchemaType.STRING)
  _id:string;

  @Type(SchemaType.STRING)
  remoteId:string;

  @Type(SchemaType.STRING)
  remoteSource:string;

  @Type(SchemaType.STRING)
  name:string;

  @Type(SchemaType.INTEGER)
  number:number;

  @Type(SchemaType.STRING)
  description:string;

  @Type(SchemaType.STRING)
  testament:string;

  @Type(SchemaType.STRING)
  copyright:string;

  @Type(SchemaType.STRING)
  author:string;

  @Type(SchemaType.STRING)
  abbreviation:string;

  @Type(SchemaType.INTEGER)
  numberOfChapters:number;

  @Type(SchemaType.DATE)
  updatedAt:Date;

  @Type(SchemaType.OBJECT, Bible)
  bible:Bible;
}