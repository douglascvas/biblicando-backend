'use strict';

import Verse = verse.Verse;
import User = user.User;

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