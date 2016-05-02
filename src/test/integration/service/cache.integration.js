'use strict';

var path = require('path');
var Configurator = require('configurator-js');
var assert = require('assert');
var CONFIG_PATH = path.resolve(__dirname, '../config/config.yml');
var config = new Configurator(CONFIG_PATH, 'biblicando');
var Cache = require('../.././redisClient');
var sinon = require('sinon');

describe.only('cache', function () {
  const CACHE_KEY = 'biblicando-cache-test';
  var cache = new Cache(config);
  this.timeout(10000);
  cache.remove(CACHE_KEY);

  after(function () {
    cache.remove(CACHE_KEY);
  });

  it('should set a value in cache', function () {
    cache.set(CACHE_KEY, 10)
      .then(() => cache.get(CACHE_KEY))
      .then(value => assert.equal(value, 10));
  });

  it('should set a value in cache with expiration', function () {
    cache.set(CACHE_KEY, 50, 500)
      .then(() => cache.get(CACHE_KEY))
      .then(value => assert.equal(value, 50))
      .then(wait(500))
      .then(() => cache.get(CACHE_KEY))
      .then(value => assert(!value));
  });

  it('should delete a value from the cache', function () {
    cache.set(CACHE_KEY, 70, 500)
      .then(() => cache.get(CACHE_KEY))
      .then(value => assert.equal(value, 70))
      .then(() => cache.remove(CACHE_KEY))
      .then(() => cache.get(CACHE_KEY))
      .then(value => assert(!value));
  });

  function wait(timeout) {
    return function () {
      var deferred = Q.defer();
      setTimeout(()=> deferred.resolve(), timeout);
      return deferred.promise;
    }
  }

});