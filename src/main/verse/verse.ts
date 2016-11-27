'use strict';
import {Chapter} from "../chapter/chapter";
import {Resource} from "../common/decorators/resource";
import {Type} from "../common/decorators/type";
import {SchemaType} from "../common/enums/schemaType";
import {RemoteResource} from "../common/interface/remoteResource";

@Resource
export class Verse implements RemoteResource {

  @Type(SchemaType.STRING)
  _id: string;

  @Type(SchemaType.STRING)
  remoteId: string;

  @Type(SchemaType.STRING)
  remoteSource: string;

  @Type(SchemaType.STRING)
  copyright: string;

  @Type(SchemaType.INTEGER)
  numbers: number[];

  @Type(SchemaType.OBJECT, Chapter)
  chapter: Chapter;

  @Type(SchemaType.STRING)
  text: string;

  @Type(SchemaType.DATE)
  updatedAt: Date;
}
