'use strict';
import {Resource} from "../common/decorators/resource";
import {Type} from "../common/decorators/type";
import {SchemaType} from "../common/enums/schemaType";

@Resource
export class Permission {

  @Type(SchemaType.STRING)
  permission:string;

  @Type(SchemaType.STRING)
  resource:string;
}