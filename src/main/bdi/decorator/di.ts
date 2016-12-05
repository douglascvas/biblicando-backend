import "reflect-metadata";

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

export interface AutoScanInfo {
  includePaths: string[],
  excludePaths: string[]
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

  if (name && typeof name === 'string') {
    return defineNamed;
  }

  // No parameter
  let target = name;
  name = null;
  defineNamed(target);
  return target;
}

export function AutoScan(includePaths?: any, excludePaths?: any): any {
  if (typeof includePaths === 'string') {
    includePaths = [includePaths];
  }
  if (!(includePaths instanceof Array)) {
    let target = includePaths;
    Reflect.defineMetadata(autoscanMetadataKey, [], target);
    return target;
  }
  return function (target: any) {
    Reflect.defineMetadata(autoscanMetadataKey, <AutoScanInfo>{
      includePaths: includePaths || [],
      excludePaths: excludePaths || []
    }, target);
  }
}

export class DI {
  public static getAutoScanConfig(target: any): AutoScanInfo {
    return Reflect.getMetadata(autoscanMetadataKey, target) || {includePaths: [], excludePaths: []};
  }

  public static getDeclaredServices(target: any): ServiceInfo[] {
    return Reflect.getMetadata(servicesMetadataKey, target) || [];
  }

  public static getDeclaredFactories(target: any): FactoryInfo[] {
    return Reflect.getMetadata(producesMetadataKey, target) || [];
  }
}