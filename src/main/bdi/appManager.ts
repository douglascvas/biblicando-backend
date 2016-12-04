import "reflect-metadata";
import {DI, ServiceInfo, FactoryInfo} from "./decorator/di";
import {Optional} from "../common/optional";
import {ModuleScannerService, ClassInfo} from "./moduleScannerService";
import {DependencyInjector} from "./dependencyInjector";
import {LoggerFactory, Logger} from "../common/loggerFactory";

export class AppManager {
  public dependencyInjector: DependencyInjector;
  private logger: Logger;

  constructor(private appInstance: any, private loggerFactory?: LoggerFactory) {
    this.logger = loggerFactory ? loggerFactory.getLogger('dependencyInjector') : <any>console;
    this.dependencyInjector = new DependencyInjector(loggerFactory);
  }

  public registerValue(name: string, value: any) {
    this.dependencyInjector.value(name, value);
  }

  public registerService(service: Function, name?: string) {
    this.dependencyInjector.service(service, name);
  }

  public registerFactory(target: any, factoryFn: Function) {
    this.dependencyInjector.factory(target, factoryFn);
  }

  public async bootstrap() {
    let pathsToScan: Optional<string[]> = DI.getAutoScanConfig(this.appInstance);
    await this.scanAndRegisterModules(pathsToScan.orElse([]));
    this.dependencyInjector.assertAllResolved();
  }

  private async scanAndRegisterModules(includePaths?: string[], excludePaths?: string[]): Promise<void> {
    let moduleScanner: ModuleScannerService = new ModuleScannerService();
    let classesInfo: ClassInfo[] = await moduleScanner.scan(includePaths, excludePaths);
    classesInfo.forEach(classInfo => this.registerClass(classInfo));
  }

  private registerClass(classInfo: ClassInfo) {
    DI.getDeclaredServices(classInfo.classz).forEach((serviceInfo: ServiceInfo) => this.registerService(serviceInfo.classz, serviceInfo.name));
    DI.getDeclaredFactories(classInfo.classz).forEach((factoryInfo: FactoryInfo) => this.registerFactory(factoryInfo.name, factoryInfo.factory));
  }
}