'use strict';
import {ValidationException} from "../exception/validationException";

const jsonschema = require("jsonschema");
const Validator = jsonschema.Validator;

export class ValidationService {
  private validator;

  constructor() {
    this.validator = new Validator();
  }

  public addSchema(schema: any){
    this.validator.addSchema(schema);
  }

  public getSchema(name:string):any {
    return require(`../common/schema/mark${name}`);
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