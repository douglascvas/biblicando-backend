'use strict';
import {Verse} from "../verse/verse";
import {Book} from "../book/book";
import {Resource} from "../common/decorators/resource";
import {Type} from "../common/decorators/type";
import {SchemaType} from "../common/enums/schemaType";

@Resource
export class Chapter {
  
  @Type(SchemaType.STRING)
  _id:string;

  @Type(SchemaType.STRING)
  remoteId:string;

  @Type(SchemaType.STRING)
  remoteSource:string;

  @Type(SchemaType.INTEGER)
  number:number;

  @Type(SchemaType.OBJECT, Book)
  book:Book;

  @Type(SchemaType.ARRAY, Verse)
  verses:Verse[];
}