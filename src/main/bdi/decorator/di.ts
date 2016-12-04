import "reflect-metadata";
import {Optional} from "../../common/optional";

const injectMetadataKey = Symbol("injectMD");
const producesMetadataKey = Symbol("producesMD");
const servicesMetadataKey = Symbol("servicesMD");
const autoscanMetadataKey = Symbol("autoScanMD");

export interface FactoryInfo {
  name: string,
  factory: Function
}

export interface ServiceInfo {
  name: string,
  classz: Function
}

// export function Inject(target) {
//   Reflect.defineMetadata(injectMetadataKey, true, target);
// }

export function Produces(name: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let producers: FactoryInfo[] = Reflect.getMetadata(producesMetadataKey, target) || [];
    producers.push({name: name, factory: descriptor.value});
    Reflect.defineMetadata(producesMetadataKey, producers, target);
  }
}

/**
 */
export function Named(name?: any): any {
  function defineNamed(target: any) {
    let services: ServiceInfo[] = Reflect.getMetadata(servicesMetadataKey, target) || [];
    services.push({name: name, classz: target});
    Reflect.defineMetadata(servicesMetadataKey, services, target)
  }

  if (typeof name !== 'string') {
    let target = name;
    defineNamed(target);
    return target;
  }
  return defineNamed;
}

export function AutoScan(paths?: any): any {
  if (!(paths instanceof Array)) {
    let target = paths;
    Reflect.defineMetadata(autoscanMetadataKey, [], target);
    return target;
  }
  return function (target: any) {
    Reflect.defineMetadata(autoscanMetadataKey, paths || [], target);
  }
}

export class DI {
  public static getAutoScanConfig(target: any): Optional<string[]> {
    return Optional.ofNullable(Reflect.getMetadata(autoscanMetadataKey, target));
  }

  public static getDeclaredServices(target: any): ServiceInfo[] {
    return Reflect.getMetadata(servicesMetadataKey, target) || [];
  }

  public static getDeclaredFactories(target: any): FactoryInfo[] {
    return Reflect.getMetadata(producesMetadataKey, target) || [];
  }
}