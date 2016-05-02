'use strict';

namespace book {

  import Bible = bible.Bible;
  export interface Book {
    _id: string;
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
}