'use strict';

import {VerseService} from "../../../../main/verse/verseService";
import {AssertThat} from "../../../assertThat";
import * as sinon from 'sinon';
import * as chai from 'chai';

const assert = chai.assert;
const assertThat = new AssertThat();

const CACHE_TIMEOUT = 1000;
const CHAPTER_ID = 'aChapter';
const REMOTE_CHAPTER_ID = 'aRemoteChapter';
const REMOTE_SOURCE = 'remoteApi';

describe('VerseService', function () {

  var cacheService, config, httpClient, verseService, verseDao, chapterDao, remoteApiInfoService, verse, returnedValue;
  var aVerse, anotherVerse, verseList, verseIdList;
  var mockRemoteResourceClassConstructorArgs, mockRemoteResource;
  var MockRemoteResourceClass;

  function stub() {
    return sinon.stub();
  }

  beforeEach(()=> {
    MockRemoteResourceClass = function() {
      mockRemoteResourceClassConstructorArgs = Array.prototype.slice.call(arguments);
      mockRemoteResource = this;
    };
    MockRemoteResourceClass.prototype.getVerses = stub();

    verse = sinon.stub();
    aVerse = {_id: 'id1'};
    anotherVerse = {_id: 'id2'};
    verseList = [aVerse, anotherVerse];
    verseIdList = [aVerse._id, anotherVerse._id];

    config = {get: stub()};
    config.get.withArgs('cache.expirationInMillis').returns(CACHE_TIMEOUT);

    httpClient = stub();
    cacheService = {get: stub(), set: stub()};

    chapterDao = {find: stub(), findOne: stub()};

    verseDao = {findByChapter: stub(), findOne: stub(), insert: stub(), find: stub(), upsertOne: stub()};
    verseDao.upsertOne.withArgs(verseList[0]).returns(Promise.resolve({upsertedId: verseList[0]._id}));
    verseDao.upsertOne.withArgs(verseList[1]).returns(Promise.resolve({upsertedId: verseList[1]._id}));
    verseDao.find.withArgs({_id: {$in: verseIdList}}).returns(Promise.resolve(verseList));

    remoteApiInfoService = {resolveFromName: stub()};
    verseService = new VerseService(config, cacheService, verseDao, chapterDao, remoteApiInfoService);
  });

  describe('#getVerses()', function () {
    it('should return the verses from cache', function () {
      return assertThat
        .given(cacheContainsSomeVerses)

        .when(callingGetVerses)

        .then(theVersesAreReturned);
    });

    it('should return the verses from the database when there is none in cache', function () {
      return assertThat
        .given(cacheContainsNoVerses)
        .given(databaseContainsSomeVerses)

        .when(callingGetVerses)

        .then(theDatabaseIsQueriedForVerses)
        .then(theVersesAreReturned);
    });

    it('should not store in cache when there is no verse in the database', function () {
      return assertThat
        .given(cacheContainsNoVerses)
        .given(databaseDoesNotContainVerses)
        .given(databaseContainsChapterWithoutRemoteSource)

        .when(callingGetVerses)

        .then(noVersesAreReturned)
        .then(nothingIsStoredInCache);
    });

    it('should get the bible from database and return no verses if bible has no remoteSource', function () {
      return assertThat
        .given(cacheContainsNoVerses)
        .given(databaseDoesNotContainVerses)
        .given(databaseContainsChapterWithoutRemoteSource)

        .when(callingGetVerses)

        .then(theDatabaseIsQueriedForChapter)
        .then(noVersesAreReturned)
    });

    it('should query for the verses in the remote resource serviceClass, but not find any, and not store in cache', function () {
      return assertThat
        .given(cacheContainsNoVerses)
        .given(databaseDoesNotContainVerses)
        .given(databaseContainsChapterWithRemoteSource)
        .given(remoteApiInfoServiceResolvesRemoteSourceInfo)
        .given(remoteSourceHasNoVersesForGivenChapter)

        .when(callingGetVerses)

        .then(remoteSourceServiceIsConstructed)
        .then(remoteSourceIsQueriedForVerses)
        .then(nothingIsStoredInCache)
        .then(noVersesAreReturned);
    });

    it('should save the verses returned from remote source in cache', function () {
      return assertThat
        .given(cacheContainsNoVerses)
        .given(databaseDoesNotContainVerses)
        .given(databaseContainsChapterWithRemoteSource)
        .given(remoteApiInfoServiceResolvesRemoteSourceInfo)
        .given(remoteSourceHasVersesForGivenChapter)

        .when(callingGetVerses)

        .then(remoteSourceServiceIsConstructed)
        .then(remoteSourceIsQueriedForVerses)
        .then(theVersesAreStoredInCache)
        .then(theVersesAreReturned);
    });
  });

  describe('#getVerse()', function () {
    it('should return the verse from cache', function () {
      return assertThat
        .given(cacheContainsTheDesiredVerse)

        .when(callingGetVerse)

        .then(theVerseIsReturned);
    });

    it('should return the verse from the database when there is none in cache', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredVerse)
        .given(databaseContainsTheDesiredVerse)

        .when(callingGetVerse)

        .then(theDatabaseIsQueriedForAVerse)
        .then(theVerseIsReturned);
    });

    it('should not store in cache when there is no verse in the database', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredVerse)
        .given(databaseDoesNotContainTheDesiredVerse)

        .when(callingGetVerse)

        .then(nothingIsStoredInCache)
        .then(noVerseIsReturned);
    });

    it('should store in cache when there is a verse in the database', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredVerse)
        .given(databaseContainsTheDesiredVerse)

        .when(callingGetVerse)

        .then(theVerseIsStoredInCache)
        .then(theVerseIsReturned);
    });


  });

  /**
   * Assert that the verse id of all verses is the right one (CHAPTER_ID)
   */
  function versesContainChapterId() {
    var verseChapterIds = [], chapterIds = [];
    verseList.forEach(verse => {
      verseChapterIds.push(verse.chapter.id);
      chapterIds.push(CHAPTER_ID);
    });
    return assert.deepEqual(verseChapterIds, chapterIds);
  }

  function remoteSourceHasNoVersesForGivenChapter() {
    MockRemoteResourceClass.prototype.getVerses.withArgs(verse.remoteId).returns(Promise.resolve([]));
  }

  function remoteSourceHasVersesForGivenChapter() {
    MockRemoteResourceClass.prototype.getVerses.withArgs(verse.remoteId).returns(Promise.resolve(verseList));
  }

  function remoteApiInfoServiceResolvesRemoteSourceInfo() {
    remoteApiInfoService.resolveFromName.withArgs(verse.remoteSource).returns({serviceClass: MockRemoteResourceClass});
  }

  function databaseContainsChapterWithoutRemoteSource() {
    verse = {_id: CHAPTER_ID, remoteId: REMOTE_CHAPTER_ID};
    chapterDao.findOne.withArgs(CHAPTER_ID).returns(Promise.resolve(verse));
  }

  function databaseContainsChapterWithRemoteSource() {
    verse = {_id: CHAPTER_ID, remoteId: REMOTE_CHAPTER_ID, remoteSource: REMOTE_SOURCE};
    chapterDao.findOne.withArgs(CHAPTER_ID).returns(Promise.resolve(verse));
  }

  function nothingIsStoredInCache() {
    return assert.equal(cacheService.set.callCount, 0);
  }

  function theVersesAreStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`verses_${CHAPTER_ID}`, verseList, CACHE_TIMEOUT).calledOnce);
  }

  function theVersesAreStoredInTheDatabase() {
    assert.isTrue(verseDao.upsertOne.withArgs(verseList[0]).calledOnce);
    assert.isTrue(verseDao.upsertOne.withArgs(verseList[1]).calledOnce);
    assert.isTrue(verseDao.find.withArgs({_id: {$in: verseIdList}}).calledOnce);
  }

  function theVerseIsStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`verse_${aVerse._id}`, aVerse, CACHE_TIMEOUT).calledOnce);
  }

  function databaseContainsSomeVerses() {
    verseDao.findByChapter.withArgs().returns(Promise.resolve(verseList));
  }

  function databaseContainsTheDesiredVerse() {
    verseDao.findOne.withArgs(aVerse._id).returns(Promise.resolve(aVerse));
  }

  function databaseDoesNotContainTheDesiredVerse() {
    verseDao.findOne.withArgs(aVerse._id).returns(Promise.resolve(null));
  }

  function databaseDoesNotContainVerses() {
    verseDao.findByChapter.withArgs().returns(Promise.resolve(null));
  }

  function cacheContainsSomeVerses() {
    cacheService.get.withArgs(`verses_${CHAPTER_ID}`).returns(Promise.resolve(verseList));
  }

  function cacheContainsTheDesiredVerse() {
    cacheService.get.withArgs(`verse_${aVerse._id}`).returns(Promise.resolve(aVerse));
  }

  function cacheDoesNotContainTheDesiredVerse() {
    cacheService.get.withArgs(`verse_${aVerse._id}`).returns(Promise.resolve(null));
  }

  function cacheContainsNoVerses() {
    cacheService.get.withArgs(`verses_${CHAPTER_ID}`).returns(Promise.resolve(null));
  }

  function callingGetVerses() {
    return verseService.getVerses(CHAPTER_ID)
      // resolve the promise value so it can be use in the next steps
      .then(resultVerses => {
        returnedValue = resultVerses;
      });
  }

  function callingGetVerse() {
    return verseService.getVerse(aVerse._id)
      // resolve the promise value so it can be use in the next steps
      .then(resultVerse => {
        returnedValue = resultVerse;
      });
  }

  function theDatabaseIsQueriedForVerses() {
    return assert.isTrue(verseDao.findByChapter.calledOnce);
  }

  function theDatabaseIsQueriedForChapter() {
    return assert.isTrue(chapterDao.findOne.withArgs(CHAPTER_ID).calledOnce);
  }

  function theDatabaseIsQueriedForAVerse() {
    return assert.isTrue(verseDao.findOne.withArgs(aVerse._id).calledOnce);
  }

  function theVersesAreReturned() {
    return assert.equal(returnedValue, verseList);
  }

  function theVerseIsReturned() {
    return assert.equal(returnedValue, aVerse);
  }

  function noVersesAreReturned() {
    return assert.deepEqual(returnedValue, []);
  }

  function noVerseIsReturned() {
    return assert.deepEqual(returnedValue, null);
  }

  function remoteSourceServiceIsConstructed() {
    return assert.deepEqual(mockRemoteResourceClassConstructorArgs, [config, httpClient, cacheService]);
  }

  /**
   * Assert that the 'getVerses' method of the RemoteResourceClass is called.
   */
  function remoteSourceIsQueriedForVerses() {
    return assert.isTrue(MockRemoteResourceClass.prototype.getVerses.withArgs(REMOTE_CHAPTER_ID).calledOnce);
  }
});