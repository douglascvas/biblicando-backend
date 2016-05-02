'use strict';
namespace common {
  import ValidationException = exception.ValidationException;
  const Validator = require('jsonschema').Validator;

  export class ValidationService {
    private validator;

    constructor() {
      this.validator = new Validator();
    }

    public rejectRequest(response, error) {
      response.status(error.status || 500).json({
        message: error.message
      });
    }

    public validate(obj, schema, throwException) {
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

    public validateAll(objects, schema, throwException = true) {
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
}