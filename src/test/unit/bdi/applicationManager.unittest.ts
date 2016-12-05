'use strict';

import * as sinon from "sinon";
import * as chai from "chai";
import {ApplicationManager} from "../../../main/bdi/applicationManager";
import {RouteManager} from "../../../main/bdi/routeManager/routeManager";
import {ModuleScannerService, ClassInfo} from "../../../main/bdi/moduleScanner/moduleScannerService";
import {LoggerFactory} from "../../../main/common/loggerFactory";
import {ExpressRouterManager} from "../../../main/bdi/routeManager/expressRouteManager";
import {DefaultModuleScannerService} from "../../../main/bdi/moduleScanner/defaultModuleScannerService";
import {AutoScan, Named, Produces} from "../../../main/bdi/decorator/di";
import {DependencyInjector} from "../../../main/bdi/dependencyInjector/dependencyInjector";
import {DefaultDependencyInjector} from "../../../main/bdi/dependencyInjector/defaultDependencyInjector";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import {RequestMapping, ResponseBody, RequestType, EndpointInfo} from "../../../main/bdi/decorator/mvc";

const assert = chai.assert;

describe('AppManager', function () {

  let appManager: ApplicationManager;
  let appInstance: any;
  let routeManager: RouteManager;
  let moduleScannerService: ModuleScannerService;
  let loggerFactory: LoggerFactory;
  let dependencyInjector: DependencyInjector;
  let byClassInstance: ByClass;


  function spy() {
    return sinon.spy();
  }

  function stub() {
    return sinon.stub();
  }

  beforeEach(() => {
    routeManager = <any>sinon.createStubInstance(ExpressRouterManager);
    moduleScannerService = <any>sinon.createStubInstance(DefaultModuleScannerService);
    dependencyInjector = <any>sinon.createStubInstance(DefaultDependencyInjector);
    loggerFactory = <any>sinon.createStubInstance(LoggerFactory);
    byClassInstance = new ByClass();
    appManager = new ApplicationManager(TestClassMain, routeManager, loggerFactory, dependencyInjector, moduleScannerService);
  });

  describe('#bootstrap()', function () {
    it('should register classes annotated with @Named', async function () {
      // given
      dependencyInjectorIsEmpty();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertServiceIsRegistered(ByClass, null);
      assertServiceIsRegistered(DependencyWithNameFromString, 'byString');
    });

    it('should not register classes that are not annotated with @Named', async function () {
      // given
      dependencyInjectorIsEmpty();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertServiceIsNotRegistered(DependencyClassNotNamed);
    });

    it('should register functions annotated with @Producer as factories', async function () {
      // given
      dependencyInjectorIsEmpty();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertFactoryIsRegistered('byFactory', TestClassMain.prototype.create);
    });

    it('should certify that all dependencies were found', async function () {
      // given
      dependencyInjectorIsEmpty();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertAllDependenciesWhereChecked();
    });

    it('should register apis annotated with @RequestMapping', async function () {
      // given
      dependencyInjectorFindsController();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertApiIsRegistered({
        path: '/testApi-1',
        type: RequestType.GET,
        callback: ByClass.prototype.testApiMethodWithResponseBody
      }, byClassInstance);

      assertApiIsRegistered({
        path: '/testApi-2',
        type: RequestType.POST,
        callback: ByClass.prototype.testApiMethodWithoutResponseBody
      }, byClassInstance);
    });

  });

  function classesInfo(): ClassInfo[] {
    return [
      {name: 'TestClassMain', classz: TestClassMain},
      {name: 'ByClass', classz: ByClass},
      {name: 'DependencyWithNameFromString', classz: DependencyWithNameFromString},
      {name: 'DependencyClassNotNamed', classz: DependencyClassNotNamed}
    ];
  }

  function assertApiIsRegistered(endpointInfo: EndpointInfo, instance: any) {
    assert.isTrue((<SinonStub>routeManager.registerApi).calledWith(endpointInfo, instance));
  }

  function assertAllDependenciesWhereChecked() {
    assert.isTrue((<SinonStub>dependencyInjector.assertAllResolved).calledWith());
  }

  function dependencyInjectorIsEmpty() {
    (<SinonStub>dependencyInjector.findAll).returns([]);
  }

  function dependencyInjectorFindsController() {
    (<SinonStub>dependencyInjector.findAll).returns([{name: 'byClass', value: byClassInstance, classz: ByClass}]);
  }

  function scannerReturnsTestClasses() {
    (<SinonStub>moduleScannerService.scan).withArgs(['i-path/'], ['e-path/']).returns(classesInfo());
  }

  function assertServiceIsNotRegistered(classz: Function) {
    let serviceRegistered = (<SinonStub>dependencyInjector.service).calledWith(classz);
    assert.isFalse(serviceRegistered);
  }

  function assertServiceIsRegistered(classz: Function, name?: string) {
    let serviceRegistered = (<SinonStub>dependencyInjector.service).calledWith(classz, name);
    assert.isTrue(serviceRegistered);
  }

  function assertFactoryIsRegistered(target: any, factory: Function) {
    let serviceRegistered = (<SinonStub>dependencyInjector.factory).calledWith(target, factory);
    assert.equal(serviceRegistered, serviceRegistered);
  }

  @AutoScan(['i-path/'], ['e-path/'])
  class TestClassMain {
    @Produces('byFactory')
    public create(): any {
      return 10;
    }
  }

  @Named
  class ByClass {
    @ResponseBody
    @RequestMapping('/testApi-1', RequestType.GET)
    public testApiMethodWithResponseBody(request, response) {
      return 'test response';
    }

    @RequestMapping('/testApi-2', RequestType.POST)
    public testApiMethodWithoutResponseBody(request, response) {
      return 'test response';
    }
  }

  @Named('byString')
  class DependencyWithNameFromString {
  }

  class DependencyClassNotNamed {
  }

});