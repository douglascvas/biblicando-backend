'use strict';

require('source-map-support').install();
import {BibleService} from "../../../../main/bible/bibleService";
import {AssertThat} from "../../../assertThat";
import * as sinon from 'sinon';
import * as chai from "chai";

const assert = chai.assert;
const stub = sinon.stub;
const assertThat = new AssertThat();
const CACHE_TIMEOUT = 1000;

describe('BibleOrgService', function () {
  var cacheService, config, httpClient,
    bibleService:BibleService,
    bibleDao, remoteApiInfoService, dependencyInjector,
    bibleList, aBible, anotherBible, returnedValue;

  beforeEach(() => {
    aBible = {_id: 'id1'};
    anotherBible = {_id: 'id2'};
    bibleList = [aBible, anotherBible];

    config = {get: stub()};
    config.get.withArgs('cache.expirationInMillis').returns(CACHE_TIMEOUT);

    httpClient = stub();
    cacheService = {get: stub(), set: stub()};
    dependencyInjector = {get: stub()};

    bibleDao = {find: stub(), findOne: stub()};
    remoteApiInfoService = stub();

    bibleService = new BibleService(config,
      httpClient,
      dependencyInjector,
      cacheService,
      bibleDao,
      remoteApiInfoService);
  });

  describe('#getBibles()', function () {
    it('should return the bibles from cache', function () {
      return assertThat
        .given(cacheContainsSomeBibles)

        .when(callingGetBibles)

        .then(theBiblesAreReturned);
    });

    it('should return the bibles from the database when there is none in cache', function () {
      return assertThat
        .given(cacheContainsNoBibles)
        .given(databaseContainsSomeBibles)

        .when(callingGetBibles)

        .then(theDatabaseIsQueriedForBibles)
        .then(theBiblesAreReturned);
    });

    it('should not store in cache when there is no bible in the database', function () {
      return assertThat
        .given(cacheContainsNoBibles)
        .given(databaseDoesNotContainBibles)

        .when(callingGetBibles)

        .then(nothingIsStoredInCache)
        .then(noBiblesAreReturned);
    });

    it('should store in cache the bibles returned from database', function () {
      return assertThat
        .given(cacheContainsNoBibles)
        .given(databaseContainsSomeBibles)

        .when(callingGetBibles)

        .then(theBiblesAreStoredInCache);
    });
  });

  describe('#getBible()', function () {
    it('should return the bible from cache', function () {
      return assertThat
        .given(cacheContainsTheDesiredBible)

        .when(callingGetBible)

        .then(theBibleIsReturned);
    });

    it('should return the bibles from the database when there is none in cache', function () {
      return assertThat
        .given(cacheDoesNotContainsDesiredBible)
        .given(databaseContainsTheDesiredBible)

        .when(callingGetBible)

        .then(theDatabaseIsQueriedForABible)
        .then(theBibleIsReturned);
    });

    it('should not store in cache when there is no bible in the database', function () {
      return assertThat
        .given(cacheDoesNotContainsDesiredBible)
        .given(databaseDoesNotContainTheDesiredBible)

        .when(callingGetBible)

        .then(nothingIsStoredInCache)
        .then(noBibleIsReturned);
    });

    it('should store in cache the bibles returned from database', function () {
      return assertThat
        .given(cacheDoesNotContainsDesiredBible)
        .given(databaseContainsTheDesiredBible)

        .when(callingGetBible)

        .then(theBibleIsStoredInCache);
    });
  });

  function nothingIsStoredInCache() {
    return assert.equal(cacheService.set.callCount, 0);
  }

  function theBiblesAreStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`bibles`, bibleList, CACHE_TIMEOUT).calledOnce);
  }

  function theBibleIsStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`bible_${aBible._id}`, aBible, CACHE_TIMEOUT).calledOnce);
  }

  function databaseContainsSomeBibles() {
    bibleDao.find.withArgs().returns(Promise.resolve(bibleList));
  }

  function databaseContainsTheDesiredBible() {
    bibleDao.findOne.withArgs(aBible._id).returns(Promise.resolve(aBible));
  }

  function databaseDoesNotContainTheDesiredBible() {
    bibleDao.findOne.withArgs(aBible._id).returns(Promise.resolve(null));
  }

  function databaseDoesNotContainBibles() {
    bibleDao.find.withArgs().returns(Promise.resolve(null));
  }

  function cacheContainsSomeBibles() {
    cacheService.get.withArgs(`bibles`).returns(Promise.resolve(bibleList));
  }

  function cacheContainsTheDesiredBible() {
    cacheService.get.withArgs(`bible_${aBible._id}`).returns(Promise.resolve(aBible));
  }

  function cacheContainsNoBibles() {
    cacheService.get.withArgs(`bibles`).returns(Promise.resolve(null));
  }

  function cacheDoesNotContainsDesiredBible() {
    cacheService.get.withArgs(`bible_${aBible._id}`).returns(Promise.resolve(null));
  }

  function callingGetBibles() {
    return bibleService.getBibles()
      .then(value => {
        returnedValue = value;
        return value;
      });
  }

  function callingGetBible() {
    return bibleService.getBible(aBible._id)
      .then(value => {
        returnedValue = value;
        return value;
      });
  }

  function theDatabaseIsQueriedForBibles() {
    return assert.isTrue(bibleDao.find.calledOnce);
  }

  function theDatabaseIsQueriedForABible() {
    return assert.isTrue(bibleDao.findOne.calledOnce);
  }

  function noBiblesAreReturned() {
    return assert.deepEqual(returnedValue, []);
  }

  function noBibleIsReturned() {
    return assert.deepEqual(returnedValue, null);
  }

  function theBiblesAreReturned() {
    return assert.equal(returnedValue, bibleList);
  }

  function theBibleIsReturned() {
    return assert.equal(returnedValue, aBible);
  }
});