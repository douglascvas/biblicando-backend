'use strict';
import {Chapter} from "../chapter/chapter";
import {Resource} from "../common/decorators/resource";
import {Type} from "../common/decorators/type";
import {SchemaType} from "../common/enums/schemaType";

@Resource
export class Verse {

  @Type(SchemaType.STRING)
  _id:string;

  @Type(SchemaType.STRING)
  remoteId:string;

  @Type(SchemaType.STRING)
  remoteSource:string;

  @Type(SchemaType.INTEGER)
  number:number;

  @Type(SchemaType.OBJECT, Chapter)
  chapter:Chapter;

  @Type(SchemaType.STRING)
  text:string;
}