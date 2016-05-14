import {ObjectUtils} from "../service/objectUtils";
import {SchemaType} from "../enums/schemaType";

export function Resource(target:any) {
  target.prototype.$resource = target.prototype.$resource || {properties: {}};
  target.prototype.$resource.id = ObjectUtils.extractClassName(target);
  target.prototype.$resource.type = SchemaType.OBJECT.value;
}