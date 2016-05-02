'use strict';

namespace bible {

  export interface Bible {
    _id:string;
    remoteId:string;
    remoteSource:string;
    name:string;
    publisher:string;
    description:string;
    languageCode:string;
    abbreviation:string;
    numberOfBooks:number;
    copyright:string;
  }
}