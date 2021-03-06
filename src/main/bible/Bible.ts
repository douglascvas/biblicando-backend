'use strict';
import {Resource} from "../common/decorators/Resource";
import {SchemaType} from "../common/enums/SchemaType";
import {Type} from "../common/decorators/Type";
import {RemoteResource} from "../common/interface/remoteResource";

@Resource
export class Bible extends Object implements RemoteResource {
  @Type(SchemaType.STRING)
  _id: string;

  @Type(SchemaType.STRING)
  remoteId: string;

  @Type(SchemaType.STRING)
  remoteSource: string;

  @Type(SchemaType.STRING)
  name: string;

  @Type(SchemaType.STRING)
  publisher: string;

  @Type(SchemaType.STRING)
  description: string;

  @Type(SchemaType.STRING)
  languageCode: string;

  @Type(SchemaType.STRING)
  languageCodeType: string;

  @Type(SchemaType.STRING)
  contactUrl: string;

  @Type(SchemaType.STRING)
  abbreviation: string;

  @Type(SchemaType.INTEGER)
  numberOfBooks: number;

  @Type(SchemaType.DATE)
  updatedAt: Date;

  @Type(SchemaType.STRING)
  copyright: string;
}
