import {SchemaType} from "../enums/schemaType";
import {ObjectUtils} from "../service/objectUtils";

export function Type(type:SchemaType, _of?:any) {
  var self = this;
  return function (target, key) {
    target.__$resource = target.__$resource || {properties: {}};
    if (_of) {
      var schemaProperty: any = target.__$resource.properties[key] = {};
      var targetProperty:any;
      if (type.value === SchemaType.ARRAY.value) {
        schemaProperty.type = type.value;
        targetProperty = schemaProperty.items = {};
      } else {
        targetProperty = schemaProperty;
      }
      if (_of instanceof SchemaType) {
        targetProperty.type = (<SchemaType>_of).value;
      } else if (typeof _of === 'string') {
        targetProperty.type = _of;
      } else {
        targetProperty.$ref = ObjectUtils.extractClassName(_of);
      }
    } else {
      target.__$resource.properties[key] = {
        type: type.value
      };
    }

    var _value = self[key];

    function getter() {
      return _value;
    }

    function setter(newValue) {
      _value = newValue;
    }

    if (delete self[key]) {
      Object.defineProperty(target, key, {
        get: getter,
        set: setter
      });
    }
  };
}
