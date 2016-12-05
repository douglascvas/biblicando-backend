import "reflect-metadata";
import {ObjectUtils} from "../../common/service/objectUtils";

export class RequestType {
  static GET = new RequestType('get');
  static POST = new RequestType('post');
  static PUT = new RequestType('put');
  static PATCH = new RequestType('patch');
  static DELETE = new RequestType('delete');

  constructor(private _value) {
  }

  get value() {
    return this._value;
  }
}

export interface EndpointInfo {
  path: string,
  type: RequestType,
  callback: Function
}


const requestMappingMetadataKey = Symbol("requestMappingMD");
// const routerMetadataKey = Symbol("routerMD");
// const originalConstructorMetadataKey = Symbol("nameMD");

// export function Controller(target) {
//   let routerIndex = Reflect.getMetadata(routerMetadataKey, target);
//   if (routerIndex === undefined) {
//     let className = ObjectUtils.extractClassName(target);
//     throw new Error(`[${className}] You must inject a router object in the class constructor and annotate it with @router`)
//   }
//
//   // save a reference to the original constructor
//   const originalConstructor = target;
//
//   // a utility function to generate instances of a class
//   function construct(constructor, args) {
//     const classz: any = function () {
//       return constructor.apply(this, args);
//     };
//     classz.prototype = constructor.prototype;
//     return new classz();
//   }
//
//   function registerApi(app, endpointInfo: EndpointInfo, instance) {
//     let method = endpointInfo.type.value;
//     console.debug(`Registering api - ${method.toUpperCase()} ${endpointInfo.path}.`);
//     app[method](endpointInfo.path, endpointInfo.callback.bind(instance));
//   }
//
//   // the new constructor behaviour
//   const newConstructor: any = (function () {
//     let resultConstructor = function Controller(...args) {
//       let endpoints: EndpointInfo[] = Reflect.getMetadata(requestMappingMetadataKey, target) || [];
//       let instance = construct(originalConstructor, args);
//       endpoints.forEach((endpoint: EndpointInfo) => registerApi(args[routerIndex], endpoint, instance));
//     };
//     Reflect.defineMetadata(originalConstructorMetadataKey, originalConstructor, resultConstructor);
//     return resultConstructor;
//   }());
//
//   // copy prototype so intanceof operator still works
//   newConstructor.prototype = originalConstructor.prototype;
//
//   // return new constructor (will override original)
//   return newConstructor;
// }

// export function Router(target: any, propertyKey: string, parameterIndex: number) {
//   Reflect.defineMetadata(routerMetadataKey, parameterIndex, target);
// }

export function RequestMapping(path: string, type?: RequestType) {
  type = type || RequestType.GET;
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    // let routerMD = Reflect.getMetadata(routerMetadataKey, target);
    // if (!routerMD) {
    // let className = ObjectUtils.extractClassName(target);
    // throw new Error(`[${className}] You must inject a router object in the class constructor and annotate it with @router`)
    // }
    let endpoints: EndpointInfo[] = Reflect.getMetadata(requestMappingMetadataKey, target) || [];
    endpoints.push({path: path, type: type, callback: descriptor.value});
    Reflect.defineMetadata(requestMappingMetadataKey, endpoints, target);
  };
}

export function ResponseBody(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  let originalMethod = descriptor.value;
  descriptor.value = function () {
    let returnValue = originalMethod.apply(this, arguments);
    let response = arguments[1];
    // If the returned value is a promise, resolve it first and then send the resulting value
    if (returnValue && typeof returnValue.then === 'function') {
      return returnValue.then((value: any) => response.send(value));
    }
    response.send(returnValue);
    return returnValue;
  }
}

export class MVC {
  // public static getOriginalConstructorFrom(target: any) {
  //   return Reflect.getMetadata(originalConstructorMetadataKey, target) || target;
  // }

  public static getEndpoints(target: any): EndpointInfo[] {
    return Reflect.getMetadata(requestMappingMetadataKey, target) || [];
  }
}