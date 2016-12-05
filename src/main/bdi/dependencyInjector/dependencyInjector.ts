'use strict';
import {Optional} from "../../common/optional";

export class Unit {
  public resolved: boolean;
  public instanceValue: any;
  public factory: Function;
  public referencedBy: Map<string, Unit>;

  constructor(public name: string,
              public classz: Function,
              public classArgs: string[]) {
    this.classArgs = classArgs || [];
    this.referencedBy = new Map();
  }
}

export interface UnitInfo {
  name: string;
  value: any;
  classz: Function;
}

export interface DependencyInjector {
  assertAllResolved(): void;
  value(name: string, value: any): void;
  service(classz: any, name?: string): void;
  factory(target: any, factoryFn: Function): void;
  findOne(name: any): Optional<any>;
  findAll(): UnitInfo[];
  assertAllResolved(): void;
}