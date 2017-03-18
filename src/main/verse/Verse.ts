'use strict';
import {Chapter} from "../chapter/Chapter";
import {Resource} from "../common/decorators/Resource";
import {Type} from "../common/decorators/Type";
import {SchemaType} from "../common/enums/SchemaType";
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
