'use strict';
import {ErrorHandlerService} from "./ErrorHandlerService";
import {Service} from "node-boot";

@Service
export class RestResponseService {
  constructor(private errorHandlerService: ErrorHandlerService) {
  }

  public respond(request, response, value?) {
    return Promise.resolve(value)
      .then(value => response.send(value))
      .catch(error => this.errorHandlerService.toRestResponse(request, response, error));
  }
}
