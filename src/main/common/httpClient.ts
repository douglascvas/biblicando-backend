import * as request from "request-promise";
import {Named} from "../bdi/decorator/di";

@Named
export class HttpClient {
  private client: any;

  constructor() {
    this.client = request;
  }

  public get(url: string): Promise<string> {
    return this.client.get(url);
  }
}