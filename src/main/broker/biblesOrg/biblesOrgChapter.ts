'use strict';
import {Bible} from "../../bible/bible";
import {Broker} from "../../common/enums/broker";
import {Chapter} from "../../chapter/chapter";

export class BiblesOrgChapter {
  id:string;
  chapter:number;
  label:string;
  auditid: number;
  osis_end:string;
  copyright:string;

  public static toChapter(biblesOrgChapter: BiblesOrgChapter):Chapter {
    var chapter:Chapter = <Chapter>{};
    chapter.number = biblesOrgChapter.chapter;
    chapter.copyright = biblesOrgChapter.copyright;
    chapter.remoteId = biblesOrgChapter.id;
    chapter.remoteSource = Broker.BIBLES_ORG.value;
    return chapter;
  }
}
