'use strict';
import {Broker} from "../../common/enums/Broker";
import {Verse} from "../../verse/Verse";

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

  private static extractVerseNumbers(biblesOrgVerse:BiblesOrgVerse):number[] {
    var result:number[] = [];
    if (biblesOrgVerse.lastverse) {
      for (let i = biblesOrgVerse.verse; i <= biblesOrgVerse.lastverse; i++) {
        result.push(i);
      }
    }
    return result;
  }

  public static toVerse(biblesOrgVerse:BiblesOrgVerse):Verse {
    var verse:Verse = <Verse>{};
    if (isNaN(biblesOrgVerse.verse)) {
      return null;
    }
    verse.text = biblesOrgVerse.text;
    verse.numbers = BiblesOrgVerse.extractVerseNumbers(biblesOrgVerse);
    verse.copyright = biblesOrgVerse.copyright;
    verse.remoteId = biblesOrgVerse.id;
    verse.remoteSource = Broker.BIBLES_ORG.value;
    if (verse.text) {
      verse.text = verse.text.replace(/(<sup .*<\/sup>)|(<h[0-9] .*<\/h[0-9]>)|(<[^>]*>)/g, '').trim();
    }

    return verse;
  }
}
