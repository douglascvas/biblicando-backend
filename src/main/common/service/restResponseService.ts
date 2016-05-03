'use strict';

import Q = require('q');

@Inject
export class RestResponseService {
  constructor(private errorHandlerService:ErrorHandlerService) {
  }

  public respond(request, response, value?) {
    return Q.when(value)
      .then(value => response.send(value))
      .catch(error => this.errorHandlerService.toRestResponse(request, response, error));
  }
}
