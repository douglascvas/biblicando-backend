'use strict';

var BibleService = require('../.././bibleService');
var path = require('path');
var Configurator = require('configurator-js');
var assert = require('assert');
var CONFIG_PATH = path.resolve(__dirname, '../config/config.yml');
var config = new Configurator(CONFIG_PATH, 'biblicando');
var request = require('request-promise');

describe('bibleService', function () {
  var bibleService = new BibleService(config, request);
  this.timeout(10000);

  it('should fetch the bibles', function () {
    return bibleService.getBibles()
      .then(bibles => {
        assert(bibles instanceof Array);
        assert(bibles.length > 100);
        console.log(bibles.length, 'bibles fetched');
      });
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