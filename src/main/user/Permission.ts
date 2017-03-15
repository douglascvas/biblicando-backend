'use strict';
import {Resource} from "../common/decorators/Resource";
import {Type} from "../common/decorators/Type";
import {SchemaType} from "../common/enums/SchemaType";

@Resource
export class Permission {

  @Type(SchemaType.STRING)
  permission:string;

  @Type(SchemaType.STRING)
  resource:string;
}