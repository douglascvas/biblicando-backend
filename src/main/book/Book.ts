'use strict';
import {Bible} from "../bible/Bible";
import {Resource} from "../common/decorators/Resource";
import {SchemaType} from "../common/enums/SchemaType";
import {Type} from "../common/decorators/Type";
import {Chapter} from "../chapter/Chapter";
import {RemoteResource} from "../common/interface/remoteResource";

@Resource
export class Book implements RemoteResource {

  @Type(SchemaType.STRING)
  _id: string;

  @Type(SchemaType.STRING)
  remoteId: string;

  @Type(SchemaType.STRING)
  remoteSource: string;

  @Type(SchemaType.STRING)
  name: string;

  @Type(SchemaType.INTEGER)
  number: number;

  @Type(SchemaType.STRING)
  description: string;

  @Type(SchemaType.STRING)
  testament: string;

  @Type(SchemaType.STRING)
  copyright: string;

  @Type(SchemaType.STRING)
  author: string;

  @Type(SchemaType.STRING)
  abbreviation: string;

  @Type(SchemaType.INTEGER)
  numberOfChapters: number;

  @Type(SchemaType.DATE)
  updatedAt: Date;

  @Type(SchemaType.OBJECT, Bible)
  bible: Bible;

  @Type(SchemaType.ARRAY, Chapter)
  chapters: Chapter[];
}