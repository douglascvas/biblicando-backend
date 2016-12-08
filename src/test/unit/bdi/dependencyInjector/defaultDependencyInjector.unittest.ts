'use strict';

import * as sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory} from "../../../../main/common/loggerFactory";
import {DefaultDependencyInjector} from "../../../../main/bdi/dependencyInjector/defaultDependencyInjector";
import {Optional} from "../../../../main/common/optional";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('DefaultDependencyInjector', function () {

  let loggerFactory: LoggerFactory;
  let dependencyInjector: DefaultDependencyInjector;
  const FOO_ID = 'fooId';
  const BAR_ID = 'barId';
  const ROCKET_ID = 'rocketId';

  beforeEach(() => {
    loggerFactory = <any>sinon.createStubInstance(LoggerFactory);
    dependencyInjector = new DefaultDependencyInjector(loggerFactory);
  });

  describe('#value', function () {
    it('should register a value', async function () {
      // given
      let value = 123;
      dependencyInjector.value("test", value);

      // when
      let result: Optional<any> = dependencyInjector.findOne("test");

      // then
      assert.equal(result.get(), value);
    });
  });

  describe('#service', function () {
    it('should register a service extracting name from class', async function () {
      // given
      dependencyInjector.service(Foo);

      // when
      let foo: Optional<any> = dependencyInjector.findOne('foo');

      // then
      assert.isTrue(foo.isPresent());
      assert.equal(foo.get().id, FOO_ID);
    });

    it('should register a service with given name', async function () {
      // given
      dependencyInjector.service(Foo, 'customFooName');

      // when
      let foo: Optional<any> = dependencyInjector.findOne('customFooName');

      // then
      assert.isTrue(foo.isPresent());
      assert.equal(foo.get().id, FOO_ID);

      foo = dependencyInjector.findOne('foo');

      assert.isFalse(foo.isPresent());
    });

    it('should register a service with a dependency', async function () {
      // given
      dependencyInjector.service(Foo);
      dependencyInjector.service(Bar);

      // when
      let bar: Optional<any> = dependencyInjector.findOne('bar');

      // then
      assert.isTrue(bar.isPresent());
      assert.equal(bar.get().id, BAR_ID);
      assert.isTrue(!!bar.get().foo);
      assert.equal(bar.get().foo.id, FOO_ID);
    });

    it('should register a service with a dependency registered after it', async function () {
      // given
      dependencyInjector.service(Bar);
      dependencyInjector.service(Foo);

      // when
      let bar: Optional<any> = dependencyInjector.findOne('bar');

      // then
      assert.isTrue(bar.isPresent());
      assert.equal(bar.get().id, BAR_ID);
      assert.isTrue(!!bar.get().foo);
      assert.equal(bar.get().foo.id, FOO_ID);
    });
  });

  describe('#factory', function () {
    it('should register a factory by extracting the name from the class', async function () {
      // given
      let factoryFn = function (rocket: Rocket) {
        let result: Foo = new Foo();
        result.rocket = rocket;
        result.rocket.id = "space rocket";
        return result;
      };
      dependencyInjector.service(Rocket);
      dependencyInjector.factory(Foo, factoryFn);

      // when
      let foo: Optional<any> = dependencyInjector.findOne('foo');

      // then
      assert.isTrue(foo.isPresent());
      assert.equal(foo.get().id, FOO_ID);
      assert.isTrue(!!foo.get().rocket);
      assert.equal(foo.get().rocket.id, "space rocket");
    });

    it('should register a factory using the given name', async function () {
      // given
      let factoryFn = function (rocket: Rocket) {
        let result: Foo = new Foo();
        result.rocket = rocket;
        result.rocket.id = "space rocket";
        return result;
      };
      dependencyInjector.service(Rocket);
      dependencyInjector.factory('customFoo', factoryFn);

      // when
      let foo: Optional<any> = dependencyInjector.findOne('customFoo');

      // then
      assert.isTrue(foo.isPresent());
      assert.equal(foo.get().id, FOO_ID);
      assert.isTrue(!!foo.get().rocket);
      assert.equal(foo.get().rocket.id, "space rocket");
    });

    it('should resolve a factory whose dependency is registered after it', async function () {
      // given
      let factoryFn = function (rocket: Rocket) {
        let result: Foo = new Foo();
        result.rocket = rocket;
        result.rocket.id = "space rocket";
        return result;
      };
      dependencyInjector.factory(Foo, factoryFn);
      dependencyInjector.service(Rocket);

      // when
      let foo: Optional<any> = dependencyInjector.findOne('foo');

      // then
      assert.isTrue(foo.isPresent());
      assert.equal(foo.get().id, FOO_ID);
      assert.isTrue(!!foo.get().rocket);
      assert.equal(foo.get().rocket.id, "space rocket");
    });
  });

  class Rocket {
    id: any = ROCKET_ID;
  }

  class Foo {
    public id: any = FOO_ID;
    public rocket: Rocket = null;
  }

  class Bar {
    id: string = BAR_ID;

    constructor(public foo: Foo) {
      console.log(foo.id);
    }
  }


});