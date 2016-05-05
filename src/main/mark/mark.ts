'use strict';
import {Verse} from "../verse/verse";
import {User} from "../user/user";

export interface Mark {
  _id:string;
  verse:Verse;
  text:string;
  startIndex:number;
  endIndex:number;
  contentHash:string;
  user:User;
  attributes:string[];
  tags:string;
  insertDate:Date
}