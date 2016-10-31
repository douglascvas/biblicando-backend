'use strict';

import {ChapterService} from "../../../../main/chapter/chapterService";
import {AssertThat} from "../../../assertThat";
import * as sinon from 'sinon';
import * as chai from 'chai';

const assert = chai.assert;
const assertThat = new AssertThat();
const CACHE_TIMEOUT = 1000;
const BOOK_ID = 'aBook';
const REMOTE_BOOK_ID = 'aRemoteBook';
const REMOTE_SOURCE = 'remoteApi';

describe('ChapterService', function () {

  var cacheService, config, httpClient, verseService,
    chapterService:ChapterService,
    chapterDao, bookDao, remoteApiInfoService, book, returnedValue;
  var aChapter, anotherChapter, chapterList, chapterIdList;
  var mockRemoteResourceClassConstructorArgs, mockRemoteResource;
  var MockRemoteResourceClass;

  function stub() {
    return sinon.stub();
  }

  beforeEach(()=> {
    MockRemoteResourceClass = function () {
      mockRemoteResourceClassConstructorArgs = Array.prototype.slice.call(arguments);
      mockRemoteResource = this;
    };
    MockRemoteResourceClass.prototype.getChapters = stub();

    book = sinon.stub();
    aChapter = {_id: 'id1'};
    anotherChapter = {_id: 'id2'};
    chapterList = [aChapter, anotherChapter];
    chapterIdList = [aChapter._id, anotherChapter._id];

    config = {find: stub()};
    config.find.withArgs('cache.expirationInMillis').returns(CACHE_TIMEOUT);

    httpClient = stub();
    cacheService = {get: stub(), set: stub()};
    verseService = {findVerses: stub()};

    bookDao = {find: stub(), findOne: stub()};

    chapterDao = {findByBook: stub(), findOne: stub(), insert: stub(), find: stub(), upsertOne: stub()};
    chapterDao.upsertOne.withArgs(chapterList[0]).returns(Promise.resolve({upsertedId: chapterList[0]._id}));
    chapterDao.upsertOne.withArgs(chapterList[1]).returns(Promise.resolve({upsertedId: chapterList[1]._id}));
    chapterDao.find.withArgs({_id: {$in: chapterIdList}}).returns(Promise.resolve(chapterList));

    remoteApiInfoService = {resolveFromName: stub()};
    chapterService = new ChapterService(config, cacheService, chapterDao, bookDao, verseService, remoteApiInfoService);
  });

  describe('#getChapters()', function () {
    it('should return the chapters from cache', function () {
      return assertThat
        .given(cacheContainsSomeChapters)

        .when(callingGetChapters)

        .then(theChaptersAreReturned);
    });

    it('should return the chapters from the database when there is none in cache', function () {
      return assertThat
        .given(cacheContainsNoChapters)
        .given(databaseContainsSomeChapters)

        .when(callingGetChapters)

        .then(theDatabaseIsQueriedForChapters)
        .then(theChaptersAreReturned);
    });

    it('should not store in cache when there is no chapter in the database', function () {
      return assertThat
        .given(cacheContainsNoChapters)
        .given(databaseDoesNotContainChapters)
        .given(databaseContainsBookWithoutRemoteSource)

        .when(callingGetChapters)

        .then(noChaptersAreReturned)
        .then(nothingIsStoredInCache);
    });

    it('should get the bible from database and return no chapters if bible has no remoteSource', function () {
      return assertThat
        .given(cacheContainsNoChapters)
        .given(databaseDoesNotContainChapters)
        .given(databaseContainsBookWithoutRemoteSource)

        .when(callingGetChapters)

        .then(theDatabaseIsQueriedForBook)
        .then(noChaptersAreReturned)
    });

    it('should query for the chapters in the remote resource serviceClass, but not find any, and not store in cache', function () {
      return assertThat
        .given(cacheContainsNoChapters)
        .given(databaseDoesNotContainChapters)
        .given(databaseContainsBookWithRemoteSource)
        .given(remoteApiInfoServiceResolvesRemoteSourceInfo)
        .given(remoteSourceHasNoChaptersForGivenBook)

        .when(callingGetChapters)

        .then(remoteSourceServiceIsConstructed)
        .then(remoteSourceIsQueriedForChapters)
        .then(nothingIsStoredInCache)
        .then(noChaptersAreReturned);
    });

    it('should save the chapters returned from remote source in the database and cache', function () {
      return assertThat
        .given(cacheContainsNoChapters)
        .given(databaseDoesNotContainChapters)
        .given(databaseContainsBookWithRemoteSource)
        .given(remoteApiInfoServiceResolvesRemoteSourceInfo)
        .given(remoteSourceHasChaptersForGivenBook)

        .when(callingGetChapters)

        .then(remoteSourceServiceIsConstructed)
        .then(remoteSourceIsQueriedForChapters)
        .then(chaptersContainBookId)
        .then(theChaptersAreStoredInTheDatabase)
        .then(theChaptersAreStoredInCache)
        .then(theChaptersAreReturned);
    });
  });

  describe('#getChapter()', function () {
    it('should return the chapter from cache', function () {
      return assertThat
        .given(cacheContainsTheDesiredChapter)

        .when(callingGetChapter)

        .then(theChapterIsReturned);
    });

    it('should return the chapter from the database when there is none in cache', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredChapter)
        .given(databaseContainsTheDesiredChapter)

        .when(callingGetChapter)

        .then(theDatabaseIsQueriedForAChapter)
        .then(theChapterIsReturned);
    });

    it('should not store in cache when there is no chapter in the database', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredChapter)
        .given(databaseDoesNotContainTheDesiredChapter)

        .when(callingGetChapter)

        .then(nothingIsStoredInCache)
        .then(noChapterIsReturned);
    });

    it('should store in cache when there is a chapter in the database', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredChapter)
        .given(databaseContainsTheDesiredChapter)

        .when(callingGetChapter)

        .then(theChapterIsStoredInCache)
        .then(theChapterIsReturned);
    });


  });

  /**
   * Assert that the book id of all chapters is the right one (BOOK_ID)
   */
  function chaptersContainBookId() {
    var chapterBookIds = [], bookIds = [];
    chapterList.forEach(chapter => {
      chapterBookIds.push(chapter.book._id);
      bookIds.push(BOOK_ID);
    });
    return assert.deepEqual(chapterBookIds, bookIds);
  }

  function remoteSourceHasNoChaptersForGivenBook() {
    MockRemoteResourceClass.prototype.getChapters.withArgs(book.remoteId).returns(Promise.resolve([]));
  }

  function remoteSourceHasChaptersForGivenBook() {
    MockRemoteResourceClass.prototype.getChapters.withArgs(book.remoteId).returns(Promise.resolve(chapterList));
  }

  function remoteApiInfoServiceResolvesRemoteSourceInfo() {
    remoteApiInfoService.resolveFromName.withArgs(book.remoteSource).returns({serviceClass: MockRemoteResourceClass});
  }

  function databaseContainsBookWithoutRemoteSource() {
    book = {_id: BOOK_ID, remoteId: REMOTE_BOOK_ID};
    bookDao.findOne.withArgs(BOOK_ID).returns(Promise.resolve(book));
  }

  function databaseContainsBookWithRemoteSource() {
    book = {_id: BOOK_ID, remoteId: REMOTE_BOOK_ID, remoteSource: REMOTE_SOURCE};
    bookDao.findOne.withArgs(BOOK_ID).returns(Promise.resolve(book));
  }

  function nothingIsStoredInCache() {
    return assert.equal(cacheService.set.callCount, 0);
  }

  function theChaptersAreStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`chapters_${BOOK_ID}`, chapterList, CACHE_TIMEOUT).calledOnce);
  }

  function theChaptersAreStoredInTheDatabase() {
    assert.isTrue(chapterDao.upsertOne.withArgs(chapterList[0]).calledOnce);
    assert.isTrue(chapterDao.upsertOne.withArgs(chapterList[1]).calledOnce);
    assert.isTrue(chapterDao.find.withArgs({_id: {$in: chapterIdList}}).calledOnce);
  }

  function theChapterIsStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`chapter_${aChapter._id}`, aChapter, CACHE_TIMEOUT).calledOnce);
  }

  function databaseContainsSomeChapters() {
    chapterDao.findByBook.withArgs().returns(Promise.resolve(chapterList));
  }

  function databaseContainsTheDesiredChapter() {
    chapterDao.findOne.withArgs(aChapter._id).returns(Promise.resolve(aChapter));
  }

  function databaseDoesNotContainTheDesiredChapter() {
    chapterDao.findOne.withArgs(aChapter._id).returns(Promise.resolve(null));
  }

  function databaseDoesNotContainChapters() {
    chapterDao.findByBook.withArgs().returns(Promise.resolve(null));
  }

  function cacheContainsSomeChapters() {
    cacheService.get.withArgs(`chapters_${BOOK_ID}`).returns(Promise.resolve(chapterList));
  }

  function cacheContainsTheDesiredChapter() {
    cacheService.get.withArgs(`chapter_${aChapter._id}`).returns(Promise.resolve(aChapter));
  }

  function cacheDoesNotContainTheDesiredChapter() {
    cacheService.get.withArgs(`chapter_${aChapter._id}`).returns(Promise.resolve(null));
  }

  function cacheContainsNoChapters() {
    cacheService.get.withArgs(`chapters_${BOOK_ID}`).returns(Promise.resolve(null));
  }

  function callingGetChapters() {
    return chapterService.getChapters(BOOK_ID)
    // resolve the promise value so it can be use in the next steps
      .then(resultChapters => {
        returnedValue = resultChapters;
      });
  }

  function callingGetChapter() {
    return chapterService.getChapter(aChapter._id)
    // resolve the promise value so it can be use in the next steps
      .then(resultChapter => {
        returnedValue = resultChapter;
      });
  }

  function theDatabaseIsQueriedForChapters() {
    return assert.isTrue(chapterDao.findByBook.calledOnce);
  }

  function theDatabaseIsQueriedForBook() {
    return assert.isTrue(bookDao.findOne.withArgs(BOOK_ID).calledOnce);
  }

  function theDatabaseIsQueriedForAChapter() {
    return assert.isTrue(chapterDao.findOne.withArgs(aChapter._id).calledOnce);
  }

  function theChaptersAreReturned() {
    return assert.equal(returnedValue, chapterList);
  }

  function theChapterIsReturned() {
    return assert.equal(returnedValue, aChapter);
  }

  function noChaptersAreReturned() {
    return assert.deepEqual(returnedValue, []);
  }

  function noChapterIsReturned() {
    return assert.deepEqual(returnedValue, null);
  }

  function remoteSourceServiceIsConstructed() {
    return assert.deepEqual(mockRemoteResourceClassConstructorArgs, [config, httpClient, cacheService]);
  }

  /**
   * Assert that the 'getChapters' method of the RemoteResourceClass is called.
   */
  function remoteSourceIsQueriedForChapters() {
    return assert.isTrue(MockRemoteResourceClass.prototype.getChapters.withArgs(REMOTE_BOOK_ID).calledOnce);
  }
});