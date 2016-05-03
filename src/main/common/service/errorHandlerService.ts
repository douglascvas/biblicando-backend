'use strict';
@Inject
export class ErrorHandlerService {
  constructor(private logger) {
  }

  public toJson(error, message) {
    const errorId = error.id || 'internal.error';
    const messageValue = message || (error.message || '').split('/n')[0];
    return {
      id: errorId,
      message: messageValue,
      time: new Date()
    };
  }

  private logRequestError(httpRequest, responseStatus, jsonValue, error) {
    var result = JSON.parse(JSON.stringify(jsonValue));
    result.url = httpRequest.path;
    result.responseStatus = responseStatus;
    result.stack = error.stack;
    this.logger.error('Request error:', result);
  }

  public toRestResponse(httpRequest, httpResponse, error) {
    const jsonValue = this.toJson(error, null);
    const status = error.status || 500;
    this.logRequestError(httpRequest, status, jsonValue, error);
    httpResponse.status(status).send(jsonValue);
  }
}