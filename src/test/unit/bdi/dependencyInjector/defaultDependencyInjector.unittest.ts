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
  });

  class Foo {
    id: any = FOO_ID;
  }

  class Bar {
    id: string = BAR_ID;

    constructor(public foo: Foo) {
      console.log(foo.id);
    }
  }

});