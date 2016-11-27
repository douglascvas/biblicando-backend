import {BiblesOrgService} from "../../broker/biblesOrg/biblesOrgService";
import {Broker} from "./broker";
import {RemoteService} from "../interface/remoteService";

export interface RemoteApiInfo {
  name:string;
  config:string;
  serviceClass: RemoteService;
}

export const RemoteApiConfig = {
  BIBLES_ORG: <RemoteApiInfo>{
    name: Broker.BIBLES_ORG.value,
    config: 'api.biblesOrg',
    serviceClass: BiblesOrgService.prototype
  }
};