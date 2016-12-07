'use strict';
import {ObjectUtils} from "../../common/service/objectUtils";
import {LoggerFactory} from "../../common/loggerFactory";
import {Optional} from "../../common/optional";
import {DependencyInjector, Unit, UnitInfo} from "./dependencyInjector";

export class DefaultDependencyInjector implements DependencyInjector {
  private translationMap: Map<string,string>;
  private logger;
  private units: Map<string, Unit>;

  constructor(private loggerFactory?: LoggerFactory) {
    this.logger = loggerFactory ? loggerFactory.getLogger('dependencyInjector') : console;
    this.translationMap = new Map();
    this.units = new Map();
    this.value('dependencyInjector', this);
  }

  /**
   * Defines an already resolved value, that will be used by the dependency management to inject in the
   * classes that has `name` as constructor dependency.
   *
   * @param name {string} Name of the dependency.
   * @param value {string} Value of the dependency.
   */
  public value(name: string, value: any): void {
    name = this.translateName(name);
    this.debugLog(`Registering value ${name}.`);
    let unit: Unit = this.getOrCreateUnit(name);
    unit.instanceValue = value;
    unit.resolved = true;
  }

  /**
   * Defines a dependency class, that will be instantiated and injected into the classes that depends on it.
   *
   * @param [name] {string} Name of the dependency. When not specified, the name will be extracted from the
   * class name.
   * @param classz {function} Function to be instantiated.
   */
  public service(classz: any, name?: string): void {
    let unit: Unit = this.getOrCreateUnit(name, classz);
    this.add(unit);
  }


  /**
   * Defines a function that will be used to build the value for the dependency defined by `classz`.
   *
   * @param target {string|function} The name of the dependency that will be resolved by the factory function.
   * If a function is passed to this parameter, the name of the function will be extracted and used instead.
   *
   * @param factoryFn {function} Function that will be called to resolve the value of the dependency.
   * The function will be called with following parameters:
   * - classz {function} class to be instantiated.
   * - dependencyValue {*} dependencies to be injected into the class constructor.
   */
  public factory(target: any, factoryFn: Function): void {
    this.assertIsFunction(factoryFn, 'The factory must be a function.');

    let unit = this.getOrCreateUnit(target);
    unit.factory = factoryFn;
    unit.classArgs = ObjectUtils.extractArgs(factoryFn);
    this.debugLog(`Registering factory for ${unit.name}`);
    unit.instanceValue = factoryFn();
    this.add(unit);
  }

  public findOne(name: any): Optional<any> {
    if (typeof name !== 'string') {
      name = ObjectUtils.extractClassName(name);
    }
    name = ObjectUtils.toInstanceName(name);
    name = this.translateName(name);
    let unit = this.units.get(name);
    if (!unit || !unit.resolved) {
      return Optional.empty();
    }
    return Optional.ofNullable(unit.instanceValue);
  }

  public findAll(): UnitInfo[] {
    return this.getUnitsWithResolvedStatusAs(true).map((unit: Unit) => ({
      name: unit.name,
      value: unit.instanceValue,
      classz: unit.classz
    }));
  }

  public assertAllResolved(): void {
    let unitNames = this.getUnitsWithResolvedStatusAs(false).map(unit => unit.name);
    if (unitNames.length) {
      throw new Error(`Some units could not be resolved: ` +
        unitNames.map(unitName => `${unitName} [${this.getMissingDependencies(unitName).join(',')}]`).join('\n'))
    }
  }

  private add(unit: Unit) {
    if (unit.resolved) {
      return this.debugLog(`Skipping registration of service ${name}. Service is already resolved.`);
    }
    this.resolve(unit);
  }

  private resolve(unit: Unit, resolveQueue?: string[]): boolean {
    const self = this;
    if (unit.resolved) {
      return true;
    }
    resolveQueue = [].concat(resolveQueue || []);

    if (resolveQueue.indexOf(unit.name) >= 0) {
      throw new Error(`Circular dependency found at ${unit.name}: ${resolveQueue.concat(' > ')}`);
    }
    resolveQueue.push(unit.name);

    let dependenciesResolved = this.resolveDependencies(unit, self, resolveQueue);

    if (!dependenciesResolved) {
      return false;
    }

    let dependencies = unit.classArgs.map((arg: string) => this.getOrCreateUnit(arg));
    let allDependenciesResolved = dependencies.every(dependency => dependency.resolved);
    if (!allDependenciesResolved) {
      return false;
    }

    let instantiated: boolean = this.instantiate(unit, dependencies);
    if (instantiated) {
      // Resolve the units that depended on this one
      unit.referencedBy.forEach((unit, name) => this.resolve(unit));
    }
    return true;
  }

  private resolveDependencies(unit: Unit, self: DefaultDependencyInjector, resolveQueue: string[]) {
    return unit.classArgs.every((dependencyName: string) => {
      let dependencyUnit: Unit = self.getOrCreateUnit(dependencyName);
      dependencyUnit.referencedBy.set(unit.name, unit);
      if (dependencyUnit.resolved) {
        return true;
      }
      return self.resolve(dependencyUnit, resolveQueue);
    });
  }

  private getOrCreateUnit(name: string, classz?: Function): Unit {
    let unitName: string = this.getInstanceName(classz, name);
    let classArgs: string[] = classz ? ObjectUtils.extractArgs(classz) : [];

    let unit = this.units.get(unitName);
    if (unit) {
      return unit;
    }
    unit = new Unit(unitName, classz, classArgs);
    this.units.set(unitName, unit);
    return unit;
  }

  private getInstanceName(classz: any, name?: string): string {
    if (!name || typeof name !== 'string') {
      let className = ObjectUtils.extractClassName(classz);
      if (!className) {
        return;
      }
      name = ObjectUtils.toInstanceName(className);
    }
    return this.translateName(name);
  }

  private getUnitsWithResolvedStatusAs(status: boolean): Unit[] {
    let result: Unit[] = [];
    for (let unit of this.units.values()) {
      if (!!unit.resolved === status) {
        result.push(unit);
      }
    }
    return result;
  }

  private debugLog(...value) {
    if (this.logger && this.logger.debug) {
      this.logger.debug.apply(this.logger, arguments);
    } else {
      console.log.apply(null, arguments);
    }
  }

  private getMissingDependencies(unitName: string) {
    let unit = this.units.get(unitName);
    if (!unit) {
      return [];
    }
    return unit.classArgs.filter(dependencyName => {
      let dependencyUnit = this.units.get(dependencyName);
      return !dependencyUnit || !dependencyUnit.resolved;
    });
  }

  private translateName(name: string): string {
    if (this.translationMap.has(name)) {
      return this.translationMap.get(name);
    }
    return name;
  }


  private defaultFactory(classz, dependencies) {
    this.debugLog("Registering default: ", this.getFunctionName(classz));
    return new (Function.prototype.bind.apply(classz, [classz].concat(dependencies)));
  }

  private instantiate(unit: Unit, dependencies: Unit[]): boolean {
    if (!unit.classz) {
      return false;
    }
    let dependencyValues = dependencies.map(dependency => dependency.instanceValue);
    if (unit.factory) {
      unit.instanceValue = unit.factory.apply(null, dependencyValues);
    } else {
      unit.instanceValue = this.defaultFactory(unit.classz, dependencyValues);
    }
    unit.resolved = true;
    return true;
  }

  private assertIsFunction(value: Object, errorMessage: string) {
    if (typeof value !== 'function') {
      throw new Error(errorMessage);
    }
  }

  private getFunctionName(classz: any) {
    if (typeof classz !== 'string') {
      return ObjectUtils.extractClassName(classz);
    }
    return classz;
  }
}