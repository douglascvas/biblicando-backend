'use strict';
import {ObjectUtils} from "./objectUtils";
import {LoggerFactory} from "../loggerFactory";

interface Dependency {
  value:any;
  classz:Function;
  missingDependencies:string[];
  resolved:boolean;
  order:number;
}

export interface DependencyEntry {
  name:string;
  value:any;
}

export class DependencyInjector {

  private translationMap:Map<string,string>;
  private values:Map<string, Dependency>;
  private factories;
  private hooks;
  private logger;

  constructor(private loggerFactory:LoggerFactory) {
    this.logger = loggerFactory.getLogger('dependencyInjector');
    this.values = new Map<string,Dependency>();
    this.factories = new Map();
    this.hooks = new Map();
    this.translationMap = new Map();
  }

  /**
   * Builds all the registered classes/values.
   */
  public build() {
    let entries = Array.from(this.values.entries());
    // Calculate the order to mount the dependency tree
    this.calculateAndSetDependenciesOrder(entries);
    // Sort the values in the order they will be resolved (all the dependencies of the each value before itself)
    entries = this.sortEntriesByDependencyOrder(entries);
    // Resolve each value
    // entries.forEach((entry, index) => console.log(`Should entry ${index}: ${entry[0]} - ${entry[1].order}`));
    entries.forEach((entry, index, list) => this.resolveInstanceFromEntry(entry));
  }

  public get(name:any):any {
    if (typeof name !== 'string') {
      name = ObjectUtils.extractClassName(name);
    }
    name = ObjectUtils.toInstanceName(name);
    name = this.translateName(name);
    const item = this.values.get(name);
    if (item) {
      return item.value;
    } else {
      return null;
    }
  }

  public getAll():DependencyEntry[] {
    return Array.from(this.values.entries())
      .map(item => {
        return {
          name: item[0],
          value: item[1].value
        };
      });
  }

  /**
   * Renames a dependency.
   */
  public rename(fromName:string, toName:string):void {
    fromName = ObjectUtils.toInstanceName(fromName);
    if (this.values.has(fromName)) {
      this.values.set(toName, this.values.get(fromName));
      this.values.delete(fromName);
    }
    this.translationMap.set(fromName, toName);
  }

  /**
   * Defines a function that will be used to build the value for the dependency defined by `classz`.
   *
   * @param classz {string|function} The name of the dependency that will be resolved by the factory function.
   * If a function is passed to this parameter, the name of the function will be extracted and used instead.
   *
   * @param factoryFn {function} Function that will be called to resolve the value of the dependency.
   * The function will be called with following parameters:
   * - classz {function} class to be instantiated.
   * - dependencyValue {*} dependencies to be injected into the class constructor.
   */
  public factory(classz:any, factoryFn:Function) {
    const className = this.translateName(this.getFunctionName(classz));
    this.assertIsFunction(factoryFn, 'The factory must be a function.');
    this.logger.debug(`Registering factory for ${name}`);
    this.factories.set(className, factoryFn);
  }

  /**
   * Calls a custom function when the value is to be injected. That means that whenever the dependency `classz`
   * is injected, it passes through the hook function first. This callback function must return the value that will
   * be injected, either the original or a modified one.
   *
   * @param classz {string|function} The name of the dependency that will be wrapped by the decorator. If a function
   * is passed to this parameter, the name of the function will be extracted and used.
   * @param callback {function} Function to be called when injecting the dependency value. Parameters:
   * - className {string} Name of the class in which the dependency is being injected
   * - dependencyValue {*} value that is being injected in the class parameter.
   */
  public hookInjection(classz:any, callback:Function) {
    const className = this.translateName(this.getFunctionName(classz));
    this.assertIsFunction(callback, 'The decorator must be a function.');
    this.logger.debug(`Registering injection hook for ${className}`);
    this.hooks.set(className, callback);
  }

  /**
   * Defines an already resolved value, that will be used by the dependency management to inject in the
   * classes that has `name` as constructor dependency.
   *
   * @param name {string} Name of the dependency.
   * @param value {string} Value of the dependency.
   */
  public value(name:string, value:any) {
    this.logger.debug(`Registering value ${name}.`);
    name = this.translateName(name);
    this.values.set(name, <Dependency>{
      value: value,
      missingDependencies: [],
      resolved: true,
      classz: null
    });
  }

  /**
   * Defines a dependency class, that will be instantiated and injected into the classes that depends on it.
   *
   * @param [name] {string} Name of the dependency. When not specified, the name will be extracted from the
   * class name.
   * @param classz {function} Function to be instantiated.
   */
  public service(classz:any, name?:string) {
    const self = this;
    const injectable:boolean = classz.$inject;

    if (!name) {
      let className = ObjectUtils.extractClassName(classz);
      if (!className) {
        return;
      }
      name = ObjectUtils.toInstanceName(className);
    }
    name = this.translateName(name);

    const classArgs: string[] = ObjectUtils.extractArgs(classz);
    if (!injectable && classArgs.length > 0) {
      this.logger.debug(`Skipping registration of service ${name}. Not an injectable (not annotated with @Inject)`);
      return;
    }
    this.logger.debug(`Registering service ${name}`);
    classArgs.forEach(arg => {
      // Insert the argument in the list
      if (!self.values.has(arg)) {
        self.values.set(name, <Dependency>{
          value: null,
          missingDependencies: [],
          resolved: false
        });
      }
    });
    self.values.set(name, <Dependency>{
      value: null,
      classz: classz,
      missingDependencies: classArgs,
      resolved: false
    });
  }

  private translateName(name:string):string {
    if (this.translationMap.has(name)) {
      return this.translationMap.get(name);
    }
    return name;
  }

  /**
   * Swap the position of two items in the array.
   *
   * @param keys {Array}
   * @param index1 {integer} position 1
   * @param index2 {integer} position 2
   */
  private swapPositions(keys:string[], index1:number, index2:number) {
    let key1 = keys[index1];
    let key2 = keys[index2];
    let value1 = this.values.get(key1);
    let value2 = this.values.get(key2);
    value1.order = index2;
    value2.order = index1;
    keys[index1] = key2;
    keys[index2] = key1;
  }

  /**
   * In order to inject the dependencies, each class needs to have its dependencies previously resolved.
   * Therefore to resolve them in sequence, the values need to be sorted in a way that the dependencies of
   * each class comes in the list in a lower position than the class itself.
   *
   * @param entries
   */
  private calculateAndSetDependenciesOrder(entries) {
    const self = this;
    const keys = entries.map(entry => entry[0]);
    for (let index = 0; index < keys.length; index++) {
      let currentIndex = index;
      let key:string = keys[index];
      let value:Dependency = self.values.get(key);
      value.order = index;
      if (!value.resolved) {
        // Find all the dependencies of the value and get the index of the latest in the list
        // so they can change positions in later. This is needed to resolve the dependencies of
        // each class, since its dependencies should already have been resolved.

        value.missingDependencies.forEach(dependencyName => {
          const depIndex = keys.indexOf(dependencyName);
          if (depIndex < 0) {
            throw new Error(`Dependency not found: ${dependencyName} (from module ${key}).`)
          }
          // Swap the keys if the dependency is in a higher position in the list
          if (depIndex > currentIndex) {
            self.swapPositions(keys, currentIndex, depIndex);
            currentIndex = depIndex;
          }
        });
      }
      // If the value was swapped, we must process again the new value at 'index' position
      // to resolve also it's dependencies.
      if (currentIndex != index) {
        index--;
      }
    }
  }

  private sortEntriesByDependencyOrder(entries) {
    return entries.sort(function (a, b) {
      return (a[1].order || 0) - (b[1].order || 0);
    });
  }

  /**
   * Gets a list of all dependencies of the class. At this point the hooks are called, passing
   * the real resolved value as parameter.
   */
  private getResolvedDependencies(entryName:string, entryValue:any) {
    const self = this;
    return entryValue.missingDependencies.map(dep => {
      const value = self.values.get(dep);
      if (!value.resolved) {
        throw new Error(`Failed to resolve dependency ${dep} (from ref. ${entryName}).`);
      }
      let hook = self.hooks.get(dep);
      if (hook) {
        return hook(entryName, value.value);
      }
      return value.value;
    });
  }

  private defaultFactory(classz, dependencies) {
    this.logger.debug("Registering default: ", this.getFunctionName(classz));
    return new (Function.prototype.bind.apply(classz, dependencies));
  }

  private getFactory(className) {
    return this.factories.get(className) || this.defaultFactory.bind(this);
  }

  private buildValue(entryName, entryValue) {
    const resolvedDependencies = this.getResolvedDependencies(entryName, entryValue);
    if (!entryValue.resolved) {
      if (!entryValue.classz) {
        throw new Error(`No class constructor found for ${entryName}.`);
      }
      resolvedDependencies.unshift(null);
      let factory = this.getFactory(entryName);
      entryValue.value = factory(entryValue.classz, resolvedDependencies);
      entryValue.resolved = true;
    }
  }

  private resolveInstanceFromEntry(entry) {
    if (!entry[1].resolved) {
      this.buildValue(entry[0], entry[1]);
    }
  }

  private assertIsFunction(value:Object, errorMessage:string) {
    if (typeof value !== 'function') {
      throw new Error(errorMessage);
    }
  }

  private getFunctionName(classz:any) {
    if (typeof classz !== 'string') {
      return ObjectUtils.extractClassName(classz);
    }
    return classz;
  }
}