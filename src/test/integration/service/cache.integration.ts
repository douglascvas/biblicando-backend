'use strict';

import * as path from "path";
import * as assert from "assert";
import {CacheService} from "../../../main/common/service/cacheService";
import {AssertThat} from "../../assertThat";
import {TestTool} from "./testTool";

const Configurator = require('configurator-js');
const CONFIG_PATH = path.resolve(__dirname, '../config/config.yml');
const config = new Configurator(CONFIG_PATH, 'biblicando');

describe('CacheService', function () {
  const CACHE_KEY = 'biblicando-cache-test';
  var cache = new CacheService(config);
  var testTool:TestTool;
  var assertThat:AssertThat;

  before(() => {
    assertThat = new AssertThat();
    testTool = new TestTool();
    return testTool.initialize(false)
      .then(() => {
        cache = testTool.dependencyInjector.get(CacheService);
        cache.remove(CACHE_KEY);
      });
  });

  after(function () {
    cache.remove(CACHE_KEY);
  });

  it('should set a value in cache', function () {
    return assertThat
      .given(() => cache.set(CACHE_KEY, 10))

      .when(() => cache.get(CACHE_KEY))

      .then(value => assert.equal(value, 10));
  });

  it('should set a value in cache with expiration', () => {
    return assertThat
      .given(() => cache.set(CACHE_KEY, 50, 200))

      .when(() => cache.get(CACHE_KEY))

      .then(value => assert.equal(value, 50))

      .given(wait(300))

      .when(() => cache.get(CACHE_KEY))

      .then(value => assert.equal(value, null));
  });

  it('should delete a value from the cache', function () {
    return assertThat
      .given(() => cache.set(CACHE_KEY, 70, 500))

      .when(() => cache.get(CACHE_KEY))

      .then(value => assert.equal(value, 70))

      .given(() => cache.remove(CACHE_KEY))

      .when(() => cache.get(CACHE_KEY))

      .then(value => assert(!value));
  });

  function wait(timeout) {
    return function () {
      return new Promise((resolve, reject)=> {
        setTimeout(()=> resolve(), timeout);
      });
    }
  }

});