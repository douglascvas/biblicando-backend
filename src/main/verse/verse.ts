'use strict';

namespace verse {
  import Chapter = chapter.Chapter;

  export interface Verse {
    _id: string;
    remoteId:string;
    remoteSource:string;
    number:number;
    chapter:Chapter;
    text:string;
  }
}