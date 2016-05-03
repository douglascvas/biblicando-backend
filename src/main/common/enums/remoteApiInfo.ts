export interface RemoteApiInfo {
  name:string;
  config:string;
  serviceClass:Object;
}

export const RemoteApiConfig = {
  BIBLES_ORG: <RemoteApiInfo>{
    name: 'biblesOrg',
    config: 'remote.api.biblesOrg',
    serviceClass: require('../service/biblesOrg/bibleOrgService')
  }
};