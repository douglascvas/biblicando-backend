'use strict';
import {Verse} from "../verse/verse";
import {Book} from "../book/book";

export interface Chapter {
  _id:string;
  remoteId:string;
  remoteSource:string;
  number:number;
  book:Book;
  verses:Verse[];
}