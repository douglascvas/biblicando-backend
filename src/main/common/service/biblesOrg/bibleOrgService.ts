'use strict';
namespace common {

  import URL = require('url');
  import Q = require('q');

  const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

  @Inject
  export class BibleOrgService {
    private baseUrl;

    constructor(private config, private httpClient, private cacheService) {
      this.baseUrl = config.get('remote.api.biblesOrg.url');
    }

    private getResourceFromCache(url) {
      var result;
      if (this.cacheService) {
        result = this.cacheService.get(url);
      } else {
        result = Q(null);
      }
      return result.then(value => {
        if (typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      })
    }

    private storeInCache(url, resource) {
      if (resource) {
        this.cacheService.set(url, resource, 5 * DAY_IN_MILLIS);
      }
    }

    private getResourceFromInternet(url, filter) {
      var self = this;
      return self.httpClient.get(url)
        .then(JSON.parse)
        .then(result => result.response)
        .then(filter)
        .then(resource => {
          self.storeInCache(url, resource);
          return resource;
        })
    }

    private getResource(url, requestFilter) {
      return this.getResourceFromCache(url)
        .then(value => value ? value : this.getResourceFromInternet(url, requestFilter));
    }

    public getBibles() {
      const url = URL.resolve(this.baseUrl, `versions.js`);
      return this.getResource(url, result => result.versions);
    }

    public getBible(bibleCode) {
      const url = URL.resolve(this.baseUrl, `versions/${bibleCode}.js`);
      return this.getResource(url, result => result.versions[0]);
    }

    public getBooks(bibleCode) {
      const url = URL.resolve(this.baseUrl, `versions/${bibleCode}/books.js`);
      return this.getResource(url, result => result.books);
    }

    public getBook(bookCode) {
      const url = URL.resolve(this.baseUrl, `books/${bookCode}.js`);
      return this.getResource(url, result => result.books[0]);
    }

    public getChapters(bookCode) {
      const url = URL.resolve(this.baseUrl, `books/${bookCode}/chapters.js`);
      return this.getResource(url, result => result.chapters);
    }

    public getChapter(chapterCode) {
      const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}.js`);
      return this.getResource(url, result => result.chapters[0]);
    }

    public getVerses(chapterCode) {
      const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}/verses.js`);
      return this.getResource(url, result => result.verses);
    }

    public getVerse(verseCode) {
      const url = URL.resolve(this.baseUrl, `verses/${verseCode}.js`);
      return this.getResource(url, result => result.verses[0]);
    }

    private getChapterCode(bibleCode, bookCode, chapterNumber) {
      return bibleCode + ':' + bookCode + '.' + chapterNumber;
    }

  }
}