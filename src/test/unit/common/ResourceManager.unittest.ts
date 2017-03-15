'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {Bible} from "../../../main/bible/Bible";
import {CacheService} from "../../../main/common/service/CacheService";
import {Config} from "../../../main/config/Config";
import {ConfigTest} from "../../ConfigTest";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ResourceManager', function () {

  let config: Config;
  let cacheService: CacheService;
  let resourceManager: ResourceManager;
  let loadFromDatabaseCallback: any;
  let loadFromRemoteCallback: any;
  let saveToDatabaseCallback: any;
  let CACHE_TIMEOUT_MILLIS = 1000;

  beforeEach(() => {
    config = new ConfigTest();
    cacheService = <any>Sinon.createStubInstance(CacheService);
    loadFromDatabaseCallback = Sinon.stub();
    loadFromRemoteCallback = Sinon.stub();
    saveToDatabaseCallback = Sinon.stub();
    config.cache.expirationInMillis = CACHE_TIMEOUT_MILLIS;
    resourceManager = new ResourceManager(config, cacheService);
  });

  describe('#getResource()', function () {
    it('should return resource from cache', async function () {
      // given
      let expectedResult = new Bible();
      expectedResult._id = "123";
      (<SinonStub>cacheService.get).withArgs('bible_123').returns(expectedResult);

      // when
      const resource: Bible = <Bible>await resourceManager.getResource("123", "bible",
        loadFromDatabaseCallback, loadFromRemoteCallback, saveToDatabaseCallback);

      // then
      assert.equal(resource, expectedResult);
    });

    it('should get resource from database and save in cache when not found in cache', async function () {
      // given
      let expectedResult = new Bible();
      expectedResult._id = "123";
      (<SinonStub>cacheService.get).withArgs('bible_123').returns(null);
      (<SinonStub>loadFromDatabaseCallback).withArgs('123').returns(expectedResult);

      // when
      const resource: Bible = <Bible>await resourceManager.getResource("123", "bible",
        loadFromDatabaseCallback, loadFromRemoteCallback, saveToDatabaseCallback);

      // then
      assert.isTrue((<SinonStub>cacheService.set).calledWith('bible_123', expectedResult, CACHE_TIMEOUT_MILLIS));
      assert.equal(resource, expectedResult);
    });

    it('should get resource from remote and save in database and cache when not found in cache neither in databasee', async function () {
      // given
      let expectedResult = new Bible();
      expectedResult._id = "123";
      (<SinonStub>cacheService.get).withArgs('bible_123').returns(null);
      (<SinonStub>loadFromDatabaseCallback).withArgs('123').returns(null);
      (<SinonStub>loadFromRemoteCallback).withArgs('123').returns(expectedResult);
      (<SinonStub>saveToDatabaseCallback).returns(expectedResult);

      // when
      const resource: Bible = <Bible>await resourceManager.getResource("123", "bible",
        loadFromDatabaseCallback, loadFromRemoteCallback, saveToDatabaseCallback);

      // then
      assert.isTrue((<SinonStub>cacheService.set).calledWith('bible_123', expectedResult, CACHE_TIMEOUT_MILLIS));
      assert.isTrue((<SinonStub>saveToDatabaseCallback).calledWith(expectedResult));
      assert.equal(resource, expectedResult);
    });
  });


});