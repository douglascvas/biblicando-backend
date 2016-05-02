'use strict';

const Q = require('q');
const sinon = require('sinon');
const chai = require("chai");
const assert = chai.assert;
const stub = sinon.stub;

const AssertThat = require('../../../assertThat');
const assertThat = new AssertThat({debug: console.log});

const BiblesOrgService = require('../../../.././biblesOrg/bibleOrgService');

describe('MarkService', function () {
  const BASE_URL = 'http://bibles.org';
  const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
  var biblesOrgService, httpClient, cacheService, config, bibleList, bookList, chapterList, verseList,
    aBible, aBook, aChapter, aVerse, anotherBible, anotherBook, anotherChapter, anotherVerse, returnedValue,
    BIBLES_URL, BIBLE_URL, BOOKS_URL, BOOK_URL, CHAPTERS_URL, CHAPTER_URL, VERSES_URL, VERSE_URL,
    biblesResponse, bibleResponse, booksResponse, bookResponse, chaptersResponse, chapterResponse,
    versesResponse, verseResponse;

  beforeEach(()=> {
    aBible = aBook = aChapter = aVerse = {id: 'rid1'};
    anotherBible = anotherBook = anotherChapter = anotherVerse = {id: 'rid2'};
    bibleList = bookList = chapterList = verseList = [aBible, anotherBible];
    BIBLES_URL = `${BASE_URL}/versions.js`;
    BIBLE_URL = `${BASE_URL}/versions/${aBible.id}.js`;
    BOOKS_URL = `${BASE_URL}/versions/${aBible.id}/books.js`;
    BOOK_URL = `${BASE_URL}/books/${aBook.id}.js`;
    CHAPTERS_URL = `${BASE_URL}/books/${aBook.id}/chapters.js`;
    CHAPTER_URL = `${BASE_URL}/chapters/${aChapter.id}.js`;
    VERSES_URL = `${BASE_URL}/chapters/${aVerse.id}/verses.js`;
    VERSE_URL = `${BASE_URL}/verses/${aVerse.id}.js`;

    biblesResponse = toRestResponse(bibleList, 'versions');
    bibleResponse = toRestResponse([aBible], 'versions');
    booksResponse = toRestResponse(bookList, 'books');
    bookResponse = toRestResponse([aBook], 'books');
    chaptersResponse = toRestResponse(chapterList, 'chapters');
    chapterResponse = toRestResponse([aChapter], 'chapters');
    versesResponse = toRestResponse(verseList, 'verses');
    verseResponse = toRestResponse([aVerse], 'verses');

    config = {get: stub()};
    httpClient = {get: stub()};
    cacheService = {get: stub(), set: stub()};

    config.get.withArgs('remote.api.biblesOrg.url').returns(BASE_URL);

    httpClient.get.withArgs(BIBLES_URL).returns(Q.when(biblesResponse));
    httpClient.get.withArgs(BIBLE_URL).returns(Q.when(bibleResponse));

    httpClient.get.withArgs(BOOKS_URL).returns(Q.when(booksResponse));
    httpClient.get.withArgs(BOOK_URL).returns(Q.when(bookResponse));

    httpClient.get.withArgs(CHAPTERS_URL).returns(Q.when(chaptersResponse));
    httpClient.get.withArgs(CHAPTER_URL).returns(Q.when(chapterResponse));

    httpClient.get.withArgs(VERSES_URL).returns(Q.when(versesResponse));
    httpClient.get.withArgs(VERSE_URL).returns(Q.when(verseResponse));

    biblesOrgService = new BiblesOrgService(config, httpClient, cacheService);
  });

  function toRestResponse(value, label) {
    var response = {
      response: {}
    };
    response.response[label] = value;
    return JSON.stringify(response);
  }

  describe('#getBibles()', function () {
    it('should return the bibles from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheBibles)

        .when(callingGetBibles)

        .then(biblesAreReturned)
        .then(nothingIsQueriedRemotely);
    });

    it('should query the bibles remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBibles)

        .then(biblesAreQueriedRemotely);
    });

    it('should store the bibles in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBibles)

        .then(biblesAreSavedInCache);
    });

    it('should return the parsed bibles', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBibles)

        .then(biblesAreReturned);
    });
  });

  describe('#getBible()', function () {
    it('should return the bibles from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheBible)

        .when(callingGetBible)

        .then(nothingIsQueriedRemotely)
        .then(bibleIsReturned);
    });

    it('should query the bibles remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBible)

        .then(bibleIsQueriedRemotely)
        .then(bibleIsReturned);
    });

    it('should store the bibles in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBible)

        .then(bibleIsSavedInCache)
        .then(bibleIsReturned);
    });

    it('should return the parsed bibles', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBible)

        .then(bibleIsReturned);
    });
  });

  describe('#getBooks()', function () {
    it('should return the books from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheBooks)

        .when(callingGetBooks)

        .then(booksAreReturned)
        .then(nothingIsQueriedRemotely);
    });

    it('should query the books remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBooks)

        .then(booksAreQueriedRemotely);
    });

    it('should store the books in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBooks)

        .then(booksAreSavedInCache);
    });

    it('should return the parsed books', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBooks)

        .then(booksAreReturned);
    });
  });

  describe('#getBook()', function () {
    it('should return the books from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheBook)

        .when(callingGetBook)

        .then(nothingIsQueriedRemotely)
        .then(bookIsReturned);
    });

    it('should query the books remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBook)

        .then(bookIsQueriedRemotely)
        .then(bookIsReturned);
    });

    it('should store the books in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBook)

        .then(bookIsSavedInCache)
        .then(bookIsReturned);
    });

    it('should return the parsed books', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetBook)

        .then(bookIsReturned);
    });
  });

  describe('#getChapters()', function () {
    it('should return the chapters from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheChapters)

        .when(callingGetChapters)

        .then(chaptersAreReturned)
        .then(nothingIsQueriedRemotely);
    });

    it('should query the chapters remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetChapters)

        .then(chaptersAreQueriedRemotely);
    });

    it('should store the chapters in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetChapters)

        .then(chaptersAreSavedInCache);
    });

    it('should return the parsed chapters', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetChapters)

        .then(chaptersAreReturned);
    });
  });

  describe('#getChapter()', function () {
    it('should return the chapters from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheChapter)

        .when(callingGetChapter)

        .then(nothingIsQueriedRemotely)
        .then(chapterIsReturned);
    });

    it('should query the chapters remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetChapter)

        .then(chapterIsQueriedRemotely)
        .then(chapterIsReturned);
    });

    it('should store the chapters in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetChapter)

        .then(chapterIsSavedInCache)
        .then(chapterIsReturned);
    });

    it('should return the parsed chapters', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetChapter)

        .then(chapterIsReturned);
    });
  });

  describe('#getVerses()', function () {
    it('should return the verses from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheVerses)

        .when(callingGetVerses)

        .then(versesAreReturned)
        .then(nothingIsQueriedRemotely);
    });

    it('should query the verses remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetVerses)

        .then(versesAreQueriedRemotely);
    });

    it('should store the verses in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetVerses)

        .then(versesAreSavedInCache);
    });

    it('should return the parsed verses', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetVerses)

        .then(versesAreReturned);
    });
  });

  describe('#getVerse()', function () {
    it('should return the verses from cache when there are some', function () {
      return assertThat
        .given(cacheContainsTheVerse)

        .when(callingGetVerse)

        .then(nothingIsQueriedRemotely)
        .then(verseIsReturned);
    });

    it('should query the verses remotely', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetVerse)

        .then(verseIsQueriedRemotely)
        .then(verseIsReturned);
    });

    it('should store the verses in cache', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetVerse)

        .then(verseIsSavedInCache)
        .then(verseIsReturned);
    });

    it('should return the parsed verses', function () {
      return assertThat
        .given(cacheDoesNotContainAnyResource)

        .when(callingGetVerse)

        .then(verseIsReturned);
    });
  });

  function nothingIsQueriedRemotely() {
    return assert.equal(httpClient.get.callCount, 0);
  }

  function biblesAreReturned() {
    return assert.deepEqual(returnedValue, bibleList);
  }

  function bibleIsReturned() {
    return assert.deepEqual(returnedValue, aBible);
  }

  function booksAreReturned() {
    return assert.deepEqual(returnedValue, bookList);
  }

  function bookIsReturned() {
    return assert.deepEqual(returnedValue, aBook);
  }

  function chaptersAreReturned() {
    return assert.deepEqual(returnedValue, chapterList);
  }

  function chapterIsReturned() {
    return assert.deepEqual(returnedValue, aChapter);
  }

  function versesAreReturned() {
    return assert.deepEqual(returnedValue, verseList);
  }

  function verseIsReturned() {
    return assert.deepEqual(returnedValue, aVerse);
  }

  function biblesAreSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(BIBLES_URL, bibleList, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function bibleIsSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(BIBLE_URL, aBible, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function booksAreSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(BOOKS_URL, bookList, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function bookIsSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(BOOK_URL, aBook, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function chaptersAreSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(CHAPTERS_URL, chapterList, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function chapterIsSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(CHAPTER_URL, aChapter, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function versesAreSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(VERSES_URL, verseList, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function verseIsSavedInCache() {
    assert.isTrue(cacheService.set.withArgs(VERSE_URL, aVerse, 5 * DAY_IN_MILLIS).calledOnce);
  }

  function callingGetBibles() {
    return biblesOrgService.getBibles()
      .then(value => returnedValue = value);
  }

  function callingGetBible() {
    return biblesOrgService.getBible(aBible.id)
      .then(value => returnedValue = value);
  }

  function callingGetBooks() {
    return biblesOrgService.getBooks(aBible.id)
      .then(value => returnedValue = value);
  }

  function callingGetBook() {
    return biblesOrgService.getBook(aBook.id)
      .then(value => returnedValue = value);
  }

  function callingGetChapters() {
    return biblesOrgService.getChapters(aBook.id)
      .then(value => returnedValue = value);
  }

  function callingGetChapter() {
    return biblesOrgService.getChapter(aChapter.id)
      .then(value => returnedValue = value);
  }

  function callingGetVerses() {
    return biblesOrgService.getVerses(aChapter.id)
      .then(value => returnedValue = value);
  }

  function callingGetVerse() {
    return biblesOrgService.getVerse(aVerse.id)
      .then(value => returnedValue = value);
  }

  function biblesAreQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(BIBLES_URL).calledOnce);
  }

  function bibleIsQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(BIBLE_URL).calledOnce);
  }

  function booksAreQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(BOOKS_URL).calledOnce);
  }

  function bookIsQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(BOOK_URL).calledOnce);
  }

  function chaptersAreQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(CHAPTERS_URL).calledOnce);
  }

  function chapterIsQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(CHAPTER_URL).calledOnce);
  }

  function versesAreQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(VERSES_URL).calledOnce);
  }

  function verseIsQueriedRemotely() {
    assert.isTrue(httpClient.get.withArgs(VERSE_URL).calledOnce);
  }

  function cacheContainsTheBibles() {
    cacheService.get.returns(Q.when(bibleList));
  }

  function cacheDoesNotContainAnyResource() {
    cacheService.get.returns(Q.when(null));
  }

  function cacheContainsTheBible() {
    cacheService.get.returns(Q.when(aBible));
  }

  function cacheContainsTheBooks() {
    cacheService.get.returns(Q.when(bookList));
  }

  function cacheContainsTheBook() {
    cacheService.get.returns(Q.when(aBook));
  }

  function cacheContainsTheChapters() {
    cacheService.get.returns(Q.when(chapterList));
  }

  function cacheContainsTheChapter() {
    cacheService.get.returns(Q.when(aChapter));
  }

  function cacheContainsTheVerses() {
    cacheService.get.returns(Q.when(verseList));
  }

  function cacheContainsTheVerse() {
    cacheService.get.returns(Q.when(aVerse));
  }
});