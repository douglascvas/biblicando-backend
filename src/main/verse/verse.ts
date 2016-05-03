'use strict';
import {Chapter} from "../chapter/chapter";

export interface Verse {
  _id:string;
  remoteId:string;
  remoteSource:string;
  number:number;
  chapter:Chapter;
  text:string;
}