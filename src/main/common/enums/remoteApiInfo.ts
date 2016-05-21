import {BiblesOrgService} from "../../broker/biblesOrg/biblesOrgService";
import {Broker} from "./broker";

export interface RemoteApiInfo {
  name:string;
  config:string;
  serviceClass:Object;
}

export const RemoteApiConfig = {
  BIBLES_ORG: <RemoteApiInfo>{
    name: Broker.BIBLES_ORG.value,
    config: 'api.biblesOrg',
    serviceClass: BiblesOrgService
  }
};