'use strict';
import {Verse} from "../verse/Verse";
import {Book} from "../book/Book";
import {Resource} from "../common/decorators/Resource";
import {Type} from "../common/decorators/Type";
import {SchemaType} from "../common/enums/SchemaType";
import {RemoteResource} from "../common/interface/remoteResource";

@Resource
export class Chapter implements RemoteResource {

  @Type(SchemaType.STRING)
  _id: string;

  @Type(SchemaType.STRING)
  remoteId: string;

  @Type(SchemaType.STRING)
  remoteSource: string;

  @Type(SchemaType.STRING)
  copyright: string;

  @Type(SchemaType.INTEGER)
  number: number;

  @Type(SchemaType.OBJECT, Book)
  book: Book;

  @Type(SchemaType.ARRAY, Verse)
  verses: Verse[];

  @Type(SchemaType.DATE)
  updatedAt: Date;
}