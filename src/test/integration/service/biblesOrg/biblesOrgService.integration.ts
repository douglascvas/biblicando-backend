'use strict';
import {TestTool} from "../testTool";
import {AssertThat} from "../../../assertThat";
import {BiblesOrgService} from "../../../../main/common/service/biblesOrg/bibleOrgService";

var path = require('path');
var assert = require('assert');
var request = require('request-promise');

describe('BibleOrgService', function () {
  var testTool:TestTool;
  var biblesOrgService:BiblesOrgService;
  var assertThat:AssertThat;

  before(() => {
    assertThat = new AssertThat();
    testTool = new TestTool();
    return testTool.initialize(false)
      .then(() => {
        biblesOrgService = testTool.dependencyInjector.get(BiblesOrgService);
      });
  });

  it('should fetch the bibles', function () {
    return assertThat
      .when(callingGetBibles)

      .then(valueIsAnArray)
      .then(valueLengthIsGreaterThan(100));
  });

  it('should fetch a specific bible', function () {
    return assertThat
      .when(callingGetBibleWith('por-NTLH'))

      .then(receivedBibleNameIs('Nova Tradução na Linguagem de Hoje'));
  });

  it('should fetch all books of a bible', function () {
    return assertThat
      .when(callingGetBooksWith('por-NTLH'))

      .then(valueIsAnArray)
      .then(valueLengthIsGreaterThan(10))
      .then(valueHasAValidBook);
  });

  it('should fetch a specific book', function () {
    return assertThat
      .when(callingGetBookWith('por-NTLH:Gen'))

      .then(bookNameIs('G\u00eanesis'));
  });

  it('should fetch all chapters of a book', function () {
    return assertThat
      .when(callingGetChaptersWith('por-NTLH:Gen'))

      .then(valueIsAnArray)
      .then(valueLengthIs(50))
      .then(valueHasAValidChapter);
  });

  it('should fetch a specific chapter', function () {
    return assertThat
      .when(callingGetChapterWith('por-NTLH:Gen.1'))

      .then(valueIsAValidChapter);
  });

  it('should fetch all verses of a chapter', function () {
    return assertThat
      .when(callingGetVersesWith('por-NTLH:Gen.1'))

      .then(valueIsAnArray)
      .then(valueLengthIs(31))
      .then(valueHasAValidVerse);
  });

  it('should fetch a specific verse', function () {
    return assertThat
      .when(callingGetVerseWith('por-NTLH:Gen.1.1'))

      .then(valueIsAValidVerse);
  });

  function callingGetBibles() {
    return biblesOrgService.getBibles();
  }

  function callingGetBibleWith(bibleId) {
    return () => biblesOrgService.getBible(bibleId);
  }

  function callingGetBooksWith(bibleId) {
    return () => biblesOrgService.getBooks(bibleId);
  }

  function callingGetBookWith(bookId) {
    return () => biblesOrgService.getBook(bookId);
  }

  function callingGetChaptersWith(bookId) {
    return () => biblesOrgService.getChapters(bookId);
  }

  function callingGetChapterWith(chapterId) {
    return () => biblesOrgService.getChapter(chapterId);
  }

  function callingGetVersesWith(chapterId) {
    return () => biblesOrgService.getVerses(chapterId);
  }

  function callingGetVerseWith(verseId) {
    return () => biblesOrgService.getVerse(verseId);
  }

  function valueIsAnArray(value) {
    assert(value instanceof Array);
    return value;
  }

  function valueLengthIsGreaterThan(amount) {
    return (value) => {
      assert(value.length > amount);
      return value;
    }
  }

  function valueLengthIs(amount) {
    return (value) => {
      assert(value.length === amount);
      return value;
    }
  }

  function valueHasAValidChapter(chapters) {
    assert(chapters[0].hasOwnProperty('chapter'));
    return chapters;
  }

  function valueIsAValidChapter(chapter) {
    assert(chapter.chapter);
    return chapter;
  }

  function valueIsAValidVerse(verse) {
    assert(verse.text);
    return verse;
  }

  function valueHasAValidVerse(verse) {
    assert(verse[0].text);
    return verse;
  }

  function receivedBibleNameIs(name:string) {
    return (bible) => {
      assert.equal(bible.name, name);
      return bible;
    }
  }

  function valueHasAValidBook(books) {
    assert(books[0].name);
    return books;
  }

  function bookNameIs(name:string) {
    return (book) => {
      assert.equal(book.name, name);
      return book;
    }
  }
});