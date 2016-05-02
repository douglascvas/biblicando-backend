'use strict';

namespace chapter {

  import Verse = verse.Verse;

  export interface Chapter {
    _id:string;
    remoteId:string;
    remoteSource:string;
    number:number;
    verses:Verse[];
  }
}