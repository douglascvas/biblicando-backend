import {BiblesOrgService} from "../service/biblesOrg/bibleOrgService";

export interface RemoteApiInfo {
  name:string;
  config:string;
  serviceClass:Object;
}

export const RemoteApiConfig = {
  BIBLES_ORG: <RemoteApiInfo>{
    name: 'biblesOrg',
    config: 'remote.api.biblesOrg',
    serviceClass: BiblesOrgService
  }
};