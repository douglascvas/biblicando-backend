import {SchemaType} from "../enums/SchemaType";
import "reflect-metadata";

const typeMetadataKey = Symbol("typeMD");

export interface TypeInfo {
  type: SchemaType;
  subtype?: any
}

export function Type(type: SchemaType, subtype?: any) {
  return function (target, key) {
    let types: Map<String, TypeInfo> = Reflect.getMetadata(typeMetadataKey, target) || new Map();
    types.set(key, {type: type, subtype: subtype});
    Reflect.defineMetadata(typeMetadataKey, types, target);
  };
}

export class TypeHelper {
  public static getTypesMetadata(target: any): Map<String, TypeInfo> {
    return Reflect.getMetadata(typeMetadataKey, target) || new Map();
  }

  public static getTypeMetadata(target: any, property: string): TypeInfo {
    return (Reflect.getMetadata(typeMetadataKey, target) || new Map()).get(property);
  }
}


