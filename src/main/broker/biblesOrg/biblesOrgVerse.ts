'use strict';
import {Broker} from "../../common/enums/broker";
import {Verse} from "../../verse/verse";

export class BiblesOrgVerse {
  id:string;
  lastverse:number;
  copyright:string;
  verse:number;
  auditid:string;
  label:string;
  text:string;
  reference:string;
  crossreferences:Array<string>;
  footnotes:Array<string>;
  osis_end:string;

  public static toVerse(biblesOrgVerse:BiblesOrgVerse):Verse {
    var verse:Verse = <Verse>{};
    verse.text = biblesOrgVerse.text;
    verse.number = biblesOrgVerse.verse;
    verse.copyright = biblesOrgVerse.copyright;
    verse.remoteId = biblesOrgVerse.id;
    verse.remoteSource = Broker.BIBLES_ORG.value;
    if (isNaN(verse.number)) {
      return null;
    }
    if (verse.text) {
      verse.text = verse.text.replace(/(<sup .*<\/sup>)|(<h[0-9] .*<\/h[0-9]>)|(<[^>]*>)/g, '').trim();
    }

    return verse;
  }
}
