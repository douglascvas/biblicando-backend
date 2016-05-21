'use strict';
import {Bible} from "../../bible/bible";
import {Broker} from "../../common/enums/broker";

export class BiblesOrgBible {
  id:string;
  name:string;
  lang:string;
  lang_code:string;
  contact_url:string;
  audio:string;
  copyright:string;
  info:string;
  lang_name:string;
  lang_name_eng:string;
  abbreviation:string;
  updated_at:string;

  public static toBible(biblesOrgBible):Bible {
    var bible:Bible = <Bible>{};
    bible.name = biblesOrgBible.name;
    bible.remoteId = biblesOrgBible.id;
    bible.abbreviation = biblesOrgBible.abbreviation;
    bible.languageCode = biblesOrgBible.lang;
    bible.languageCodeType = biblesOrgBible.lang_code;
    bible.contactUrl = biblesOrgBible.contact_url;
    bible.description = biblesOrgBible.info;
    bible.updatedAt = new Date(biblesOrgBible.updated_at);
    bible.copyright = biblesOrgBible.copyright;
    bible.remoteSource = Broker.BIBLES_ORG.value;
    return bible;
  }
}
