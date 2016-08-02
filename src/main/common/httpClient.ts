import {Promise} from "./interface/promise";
import * as request from "request-promise";
import {Inject} from "./decorators/inject";

@Inject
export class HttpClient {
  private client:any;

  constructor() {
    this.client = request;
  }

  public get(url:string):Promise<string> {
    return this.client.get(url);
  }
}