'use strict';
import {BookService} from "../../../../main/book/bookService";
import {AssertThat} from "../../../assertThat";
import * as Q from 'q';
import * as sinon from 'sinon';
import * as chai from "chai";
import {LoggerFactory} from "../../../../main/common/loggerFactory";

const assert = chai.assert;
const stub = sinon.stub;

const assertThat = new AssertThat();

const CACHE_TIMEOUT = 1000;
const BIBLE_ID = 'aBible';
const REMOTE_BIBLE_ID = 'aRemoteBible';
const REMOTE_SOURCE = 'remoteApi';

describe('BookService', function () {

  var cacheService, config, httpClient,
    bookService:BookService,
    bookDao, bibleDao, remoteApiInfoService, bible, returnedValue, loggerFactory;
  var aBook, anotherBook, bookList, bookIdList;
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
    MockRemoteResourceClass.prototype.getBooks = stub();

    bible = sinon.stub();
    aBook = {_id: 'id1'};
    anotherBook = {_id: 'id2'};
    bookList = [aBook, anotherBook];
    bookIdList = [aBook._id, anotherBook._id];

    config = {get: stub()};
    config.get.withArgs('cache.expirationInMillis').returns(CACHE_TIMEOUT);

    httpClient = stub();
    cacheService = {get: stub(), set: stub()};
    loggerFactory = new LoggerFactory();

    bibleDao = {find: stub(), findOne: stub()};

    bookDao = {findByBible: stub(), findOne: stub(), insert: stub(), find: stub(), upsertOne: stub()};
    bookDao.upsertOne.withArgs(bookList[0]).returns(Q.when({upsertedId: bookList[0]._id}));
    bookDao.upsertOne.withArgs(bookList[1]).returns(Q.when({upsertedId: bookList[1]._id}));
    bookDao.find.withArgs({_id: {$in: bookIdList}}).returns(Q.when(bookList));

    remoteApiInfoService = {resolveFromName: stub()};
    bookService = new BookService(config, httpClient, cacheService, bookDao, bibleDao,
      remoteApiInfoService, loggerFactory);
  });

  describe('#getBooks()', function () {
    it('should return the books from cache', function () {
      return assertThat
        .given(cacheContainsSomeBooks)

        .when(callingGetBooks)

        .then(theBooksAreReturned);
    });

    it('should return the books from the database when there is none in cache', function () {
      return assertThat
        .given(cacheContainsNoBooks)
        .given(databaseContainsSomeBooks)

        .when(callingGetBooks)

        .then(theDatabaseIsQueriedForBooks)
        .then(theBooksAreReturned);
    });

    it('should not store in cache when there is no book in the database', function () {
      return assertThat
        .given(cacheContainsNoBooks)
        .given(databaseDoesNotContainBooks)
        .given(databaseContainsBibleWithoutRemoteSource)

        .when(callingGetBooks)

        .then(noBooksAreReturned)
        .then(nothingIsStoredInCache);
    });

    it('should get the bible from database and return no books if bible has no remoteSource', function () {
      return assertThat
        .given(cacheContainsNoBooks)
        .given(databaseDoesNotContainBooks)
        .given(databaseContainsBibleWithoutRemoteSource)

        .when(callingGetBooks)

        .then(theDatabaseIsQueriedForBible)
        .then(noBooksAreReturned)
    });

    it('should query for the books in the remote resource serviceClass, but not find any, and not store in cache', function () {
      return assertThat
        .given(cacheContainsNoBooks)
        .given(databaseDoesNotContainBooks)
        .given(databaseContainsBibleWithRemoteSource)
        .given(remoteApiInfoServiceResolvesRemoteSourceInfo)
        .given(remoteSourceHasNoBooksForGivenBible)

        .when(callingGetBooks)

        .then(remoteSourceServiceIsConstructed)
        .then(remoteSourceIsQueriedForBooks)
        .then(nothingIsStoredInCache)
        .then(noBooksAreReturned);
    });

    it('should save the books returned from remote source in the database and cache', function () {
      return assertThat
        .given(cacheContainsNoBooks)
        .given(databaseDoesNotContainBooks)
        .given(databaseContainsBibleWithRemoteSource)
        .given(remoteApiInfoServiceResolvesRemoteSourceInfo)
        .given(remoteSourceHasBooksForGivenBible)

        .when(callingGetBooks)

        .then(remoteSourceServiceIsConstructed)
        .then(remoteSourceIsQueriedForBooks)
        .then(booksContainBibleId)
        .then(theBooksAreStoredInTheDatabase)
        .then(theBooksAreStoredInCache)
        .then(theBooksAreReturned);
    });
  });

  describe('#getBook()', function () {
    it('should return the book from cache', function () {
      return assertThat
        .given(cacheContainsTheDesiredBook)

        .when(callingGetBook)

        .then(theBookIsReturned);
    });

    it('should return the book from the database when there is none in cache', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredBook)
        .given(databaseContainsTheDesiredBook)

        .when(callingGetBook)

        .then(theDatabaseIsQueriedForABook)
        .then(theBookIsReturned);
    });

    it('should not store in cache when there is no book in the database', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredBook)
        .given(databaseDoesNotContainTheDesiredBook)

        .when(callingGetBook)

        .then(nothingIsStoredInCache)
        .then(noBookIsReturned);
    });

    it('should store in cache when there is a book in the database', function () {
      return assertThat
        .given(cacheDoesNotContainTheDesiredBook)
        .given(databaseContainsTheDesiredBook)

        .when(callingGetBook)

        .then(theBookIsStoredInCache)
        .then(theBookIsReturned);
    });


  });

  /**
   * Assert that the bible id of all books is the right one (BIBLE_ID)
   */
  function booksContainBibleId() {
    var bookBibleIds = [], bibleIds = [];
    bookList.forEach(book => {
      bookBibleIds.push(book.bible._id);
      bibleIds.push(BIBLE_ID);
    });
    return assert.deepEqual(bookBibleIds, bibleIds);
  }

  function remoteSourceHasNoBooksForGivenBible() {
    MockRemoteResourceClass.prototype.getBooks.withArgs(bible.remoteId).returns(Q.when([]));
  }

  function remoteSourceHasBooksForGivenBible() {
    MockRemoteResourceClass.prototype.getBooks.withArgs(bible.remoteId).returns(Q.when(bookList));
  }

  function remoteApiInfoServiceResolvesRemoteSourceInfo() {
    remoteApiInfoService.resolveFromName.withArgs(bible.remoteSource).returns({serviceClass: MockRemoteResourceClass});
  }

  function databaseContainsBibleWithoutRemoteSource() {
    bible = {_id: BIBLE_ID, remoteId: REMOTE_BIBLE_ID};
    bibleDao.findOne.withArgs(BIBLE_ID).returns(Q.when(bible));
  }

  function databaseContainsBibleWithRemoteSource() {
    bible = {_id: BIBLE_ID, remoteId: REMOTE_BIBLE_ID, remoteSource: REMOTE_SOURCE};
    bibleDao.findOne.withArgs(BIBLE_ID).returns(Q.when(bible));
  }

  function nothingIsStoredInCache() {
    return assert.equal(cacheService.set.callCount, 0);
  }

  function theBooksAreStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`books_${BIBLE_ID}`, bookList, CACHE_TIMEOUT).calledOnce);
  }

  function theBooksAreStoredInTheDatabase() {
    assert.isTrue(bookDao.upsertOne.withArgs(bookList[0]).calledOnce);
    assert.isTrue(bookDao.upsertOne.withArgs(bookList[1]).calledOnce);
    assert.isTrue(bookDao.find.withArgs({_id: {$in: bookIdList}}).calledOnce);
  }

  function theBookIsStoredInCache() {
    return assert.isTrue(cacheService.set.withArgs(`book_${aBook._id}`, aBook, CACHE_TIMEOUT).calledOnce);
  }

  function databaseContainsSomeBooks() {
    bookDao.findByBible.withArgs().returns(Q.when(bookList));
  }

  function databaseContainsTheDesiredBook() {
    bookDao.findOne.withArgs(aBook._id).returns(Q.when(aBook));
  }

  function databaseDoesNotContainTheDesiredBook() {
    bookDao.findOne.withArgs(aBook._id).returns(Q.when(null));
  }

  function databaseDoesNotContainBooks() {
    bookDao.findByBible.withArgs().returns(Q.when(null));
  }

  function cacheContainsSomeBooks() {
    cacheService.get.withArgs(`books_${BIBLE_ID}`).returns(Q.when(bookList));
  }

  function cacheContainsTheDesiredBook() {
    cacheService.get.withArgs(`book_${aBook._id}`).returns(Q.when(aBook));
  }

  function cacheDoesNotContainTheDesiredBook() {
    cacheService.get.withArgs(`book_${aBook._id}`).returns(Q.when(null));
  }

  function cacheContainsNoBooks() {
    cacheService.get.withArgs(`books_${BIBLE_ID}`).returns(Q.when(null));
  }

  function callingGetBooks() {
    return bookService.getBooks(BIBLE_ID)
    // resolve the promise value so it can be use in the next steps
      .then(resultBooks => {
        returnedValue = resultBooks;
      });
  }

  function callingGetBook() {
    return bookService.getBook(aBook._id)
    // resolve the promise value so it can be use in the next steps
      .then(resultBook => {
        returnedValue = resultBook;
      });
  }

  function theDatabaseIsQueriedForBooks() {
    return assert.isTrue(bookDao.findByBible.calledOnce);
  }

  function theDatabaseIsQueriedForBible() {
    return assert.isTrue(bibleDao.findOne.withArgs(BIBLE_ID).calledOnce);
  }

  function theDatabaseIsQueriedForABook() {
    return assert.isTrue(bookDao.findOne.withArgs(aBook._id).calledOnce);
  }

  function theBooksAreReturned() {
    return assert.equal(returnedValue, bookList);
  }

  function theBookIsReturned() {
    return assert.equal(returnedValue, aBook);
  }

  function noBooksAreReturned() {
    return assert.deepEqual(returnedValue, []);
  }

  function noBookIsReturned() {
    return assert.deepEqual(returnedValue, null);
  }

  function remoteSourceServiceIsConstructed() {
    return assert.deepEqual(mockRemoteResourceClassConstructorArgs, [config, httpClient, cacheService]);
  }

  /**
   * Assert that the 'getBooks' method of the RemoteResourceClass is called.
   */
  function remoteSourceIsQueriedForBooks() {
    return assert.isTrue(MockRemoteResourceClass.prototype.getBooks.withArgs(REMOTE_BIBLE_ID).calledOnce);
  }
});