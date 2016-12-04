'use strict';
import {Named} from "../../bdi/decorator/di";
import {ErrorHandlerService} from "./errorHandlerService";

@Named
export class RestResponseService {
  constructor(private errorHandlerService: ErrorHandlerService) {
  }

  public respond(request, response, value?) {
    return Promise.resolve(value)
      .then(value => response.send(value))
      .catch(error => this.errorHandlerService.toRestResponse(request, response, error));
  }
}
