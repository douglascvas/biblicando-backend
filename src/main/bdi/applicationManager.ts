import "reflect-metadata";
import {DI, ServiceInfo, FactoryInfo, AutoScanInfo} from "./decorator/di";
import {DefaultDependencyInjector} from "./dependencyInjector/defaultDependencyInjector";
import {LoggerFactory, Logger} from "../common/loggerFactory";
import {MVC, EndpointInfo} from "./decorator/mvc";
import {RouteManager} from "./routeManager/routeManager";
import {ModuleScannerService, ClassInfo} from "./moduleScanner/moduleScannerService";
import {DefaultModuleScannerService} from "./moduleScanner/defaultModuleScannerService";
import {DependencyInjector} from "./dependencyInjector/dependencyInjector";

export class ApplicationManager {
  private logger: Logger;

  constructor(private mainApplicationClass: any,
              private routeManager?: RouteManager,
              private loggerFactory?: LoggerFactory,
              private dependencyInjector?: DependencyInjector,
              private moduleScannerService?: ModuleScannerService) {
    this.logger = loggerFactory ? loggerFactory.getLogger('dependencyInjector') : <any>console;
    this.dependencyInjector = dependencyInjector || new DefaultDependencyInjector(loggerFactory);
    this.moduleScannerService = moduleScannerService || new DefaultModuleScannerService();
    this.dependencyInjector.value('applicationManager', this);
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

  public async bootstrap(): Promise<any> {
    this.dependencyInjector.service(this.mainApplicationClass);
    let autoScanInfo: AutoScanInfo = DI.getAutoScanConfig(this.mainApplicationClass);
    if (autoScanInfo) {
      await this.scanAndRegisterModules(autoScanInfo.includePaths, autoScanInfo.excludePaths);
    }
    this.dependencyInjector.assertAllResolved();
    await this.registerEndpoints();
    return this.dependencyInjector.findOne(this.mainApplicationClass).get();
  }

  private async scanAndRegisterModules(includePaths?: string[], excludePaths?: string[]): Promise<void> {
    let classesInfo: ClassInfo[] = await this.moduleScannerService.scan(includePaths, excludePaths);
    classesInfo.forEach(classInfo => this.registerClass(classInfo));
  }

  private registerClass(classInfo: ClassInfo) {
    DI.getDeclaredServices(classInfo.classz)
      .forEach((serviceInfo: ServiceInfo) => this.registerService(serviceInfo.classz, serviceInfo.name));
    DI.getDeclaredFactories(classInfo.classz)
      .forEach((factoryInfo: FactoryInfo) => this.registerFactory(factoryInfo.name, factoryInfo.factory));
  }

  private registerEndpoints() {
    let self = this;
    this.dependencyInjector.findAll()
      .filter(unit => unit.classz)
      .forEach(unit => {
        let endpointsInfo: EndpointInfo[] = MVC.getEndpoints(unit.classz);
        endpointsInfo.forEach(endpointInfo => self.routeManager.registerApi(endpointInfo, unit.value));
      });
  }
}