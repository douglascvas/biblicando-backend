'use strict';
import {Inject} from "../../decorators/inject";
import {CacheService} from "../cacheService";
import * as URL from "url";
import * as Q from "q";
import IPromise = Q.IPromise;
import {Book} from "../../../book/book";
import {Bible} from "../../../bible/bible";
import {Chapter} from "../../../chapter/chapter";
import {Verse} from "../../../verse/verse";

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

@Inject()
export class BibleOrgService {
  private baseUrl;

  constructor(private config,
              private httpClient,
              private cacheService:CacheService) {
    this.baseUrl = config.get('remote.api.biblesOrg.url');
  }

  private getResourceFromCache(url:string):any {
    var result;
    if (this.cacheService) {
      result = this.cacheService.getFromCache(url);
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

  private saveToCache(url:string, resource:any):IPromise<any> {
    if (resource) {
      return this.cacheService.saveToCache(url, resource, 5 * DAY_IN_MILLIS);
    }
    return Q.when();
  }

  private getResourceFromInternet(url:string, filter:Function):IPromise<any> {
    var self = this;
    return self.httpClient.get(url)
      .then(JSON.parse)
      .then(result => result.response)
      .then(filter)
      .then(resource => {
        self.saveToCache(url, resource);
        return resource;
      })
  }

  private getResource(url:string, requestFilter:Function):IPromise<any> {
    return this.getResourceFromCache(url)
      .then(value => value ? value : this.getResourceFromInternet(url, requestFilter));
  }

  public getBibles():IPromise<Bible[]> {
    const url = URL.resolve(this.baseUrl, `versions.js`);
    return this.getResource(url, result => result.versions);
  }

  public getBible(bibleCode:string):IPromise<Bible> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}.js`);
    return this.getResource(url, result => result.versions[0]);
  }

  public getBooks(bibleCode:string):IPromise<Book[]> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}/books.js`);
    return this.getResource(url, result => result.books);
  }

  public getBook(bookCode:string):IPromise<Book> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}.js`);
    return this.getResource(url, result => result.books[0]);
  }

  public getChapters(bookCode:string):IPromise<Chapter[]> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}/chapters.js`);
    return this.getResource(url, result => result.chapters);
  }

  public getChapter(chapterCode:string):IPromise<Chapter> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}.js`);
    return this.getResource(url, result => result.chapters[0]);
  }

  public getVerses(chapterCode:string):IPromise<Verse[]> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}/verses.js`);
    return this.getResource(url, result => result.verses);
  }

  public getVerse(verseCode:string):IPromise<Verse> {
    const url = URL.resolve(this.baseUrl, `verses/${verseCode}.js`);
    return this.getResource(url, result => result.verses[0]);
  }

  private getChapterCode(bibleCode:string, bookCode:string, chapterNumber:number):string {
    return bibleCode + ':' + bookCode + '.' + chapterNumber;
  }

}