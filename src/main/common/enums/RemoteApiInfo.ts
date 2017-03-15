import {BiblesOrgService} from "../../broker/biblesOrg/BiblesOrgService";
import {Broker} from "./Broker";
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