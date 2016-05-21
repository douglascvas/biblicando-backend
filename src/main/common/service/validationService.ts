'use strict';
import {ValidationException} from "../exception/validationException";
import {LoggerFactory} from "../loggerFactory";
import {Inject} from "../decorators/inject";

const jsonschema = require("jsonschema");
const Validator = jsonschema.Validator;

@Inject
export class ValidationService {
  private validator;
  private logger;

  constructor(loggerFactory:LoggerFactory) {
    this.validator = new Validator();
    this.logger = loggerFactory.getLogger('ValidationService');
  }

  public addSchema(schema:any) {
    this.logger.debug(`Registering resource ${schema.id}`);
    this.validator.addSchema(schema);
  }

  public getSchema(name:string):any {
    return this.validator.getSchema(name);
  }

  public rejectRequest(response, error) {
    response.status(error.status || 500).json({
      message: error.message
    });
  }

  public validate(obj:any, schema:any, throwException?:boolean) {
    if (throwException === undefined) {
      throwException = true;
    }
    var result = this.validator.validate(obj, schema);
    if (result.valid) {
      return result;
    }
    if (throwException) {
      throw new ValidationException(result);
    }
    return result;
  }

  public validateAll(objects:any, schema:any, throwException?:boolean) {
    if (throwException === undefined) {
      throwException = true;
    }
    var hasError = false;
    var validationResult = objects.filter(obj => {
      var result = this.validator.validate(obj, schema);
      hasError = hasError || !result.valid;
      return result;
    });
    if (hasError) {
      throw new ValidationException(validationResult);
    }
    return validationResult;
  }
}