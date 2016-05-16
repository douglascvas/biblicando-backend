import {ObjectUtils} from "../service/objectUtils";
import {SchemaType} from "../enums/schemaType";

export function Resource(target:any) {
  target.prototype.__$resource = target.prototype.__$resource || {properties: {}};
  target.prototype.__$resource.id = ObjectUtils.extractClassName(target);
  target.prototype.__$resource.type = SchemaType.OBJECT.value;
}