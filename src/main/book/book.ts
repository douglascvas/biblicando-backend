'use strict';
import {Bible} from "../bible/bible";

export interface Book {
  _id:string;
  remoteId:string;
  remoteSource:string;
  name:string;
  number:number;
  description:string;
  author:string;
  abbreviation:string;
  numberOfChapters:number;
  bible:Bible;
}