'use strict';
import {BibleService} from "../../../main/bible/bibleService";
import {TestTool} from "./testTool";
import {AssertThat} from "../../assertThat";

var path = require('path');
var assert = require('assert');
var request = require('request-promise');

describe('bibleService', function () {
  var testTool:TestTool = new TestTool();
  var assertThat:AssertThat;
  var returnedValue;

  before(() => {
    assertThat = new AssertThat();
    return testTool.initialize();
  });

  var bibleService = testTool.dependencyInjector.get(BibleService);

  function callingGetBibles() {
    return bibleService.getBibles()
      .then(bibles=> {
        returnedValue = bibles;
      })
  }

  function valueIsAnArray() {
    assert(returnedValue instanceof Array);
  }

  function valueIsBigEnough() {
    assert(returnedValue.length > 100);
  }

  it('should fetch the bibles', function () {
    assertThat
      .when(callingGetBibles)
      
      .then(valueIsAnArray)
      .then(valueIsBigEnough)
  });

  it('should fetch a specific bible', function () {
    return bibleService.getBible('por-NTLH')
      .then(bible => assert.equal(bible.name, 'Nova Tradução na Linguagem de Hoje'));
  });

  it('should fetch all books of a bible', function () {
    return bibleService.getBooks('por-NTLH')
      .then(books => {
        assert(books instanceof Array);
        assert(books.length > 10);
        assert(books[0].name);
      });
  });

  it('should fetch a specific book', function () {
    return bibleService.getBook('por-NTLH:Gen')
      .then(book => assert.equal(book.name, 'G\u00eanesis'));
  });

  it('should fetch all chapters f a book', function () {
    return bibleService.getChapters('por-NTLH:Gen')
      .then(chapters => {
        assert(chapters instanceof Array);
        assert.equal(chapters.length, 50);
        assert(chapters[0].chapter);
      });
  });

  it('should fetch a specific chapter', function () {
    return bibleService.getChapter('por-NTLH:Gen.1')
      .then(chapter => assert(chapter.chapter));
  });

  it('should fetch all verses of a chapter', function () {
    return bibleService.getVerses('por-NTLH:Gen.1')
      .then(verses => {
        assert(verses instanceof Array);
        assert.equal(verses.length, 31);
        assert(verses[0].text);
      });
  });

  it('should fetch a specific verse', function () {
    return bibleService.getVerse('por-NTLH:Gen.1.1')
      .then(verse => assert(verse.text));
  });
});