'use strict';
import {Inject} from "../../common/decorators/inject";
import {CacheService} from "../../common/service/cacheService";
import * as URL from "url";
import {Book} from "../../book/book";
import {Bible} from "../../bible/bible";
import {Chapter} from "../../chapter/chapter";
import {Verse} from "../../verse/verse";
import {Promise} from "../../common/interface/promise";
import {BiblesOrgBible} from "./biblesOrgBible";
import {BiblesOrgBook} from "./biblesOrgBook";
import {BiblesOrgChapter} from "./biblesOrgChapter";
import {BiblesOrgVerse} from "./biblesOrgVerse";

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

@Inject
export class BiblesOrgService {
  private baseUrl;

  constructor(private config,
              private httpClient,
              private cacheService:CacheService) {
    this.baseUrl = config.get('api.biblesOrg.url');
  }

  private getResourceFromCache(url:string):any {
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

  private saveToCache(url:string, resource:any):Promise<any> {
    if (resource) {
      return this.cacheService.set(url, resource, 5 * DAY_IN_MILLIS);
    }
    return Promise.resolve();
  }

  private getResourceFromInternet(url:string, filter:Function):Promise<any> {
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

  private getResource(url:string, requestFilter:Function):Promise<any> {
    return this.getResourceFromCache(url)
      .then(value => value ? value : this.getResourceFromInternet(url, requestFilter));
  }

  public getBibles():Promise<Bible[]> {
    const url = URL.resolve(this.baseUrl, `versions.js`);
    return this.getResource(url, result => result.versions)
      .then((bibles:Array<BiblesOrgBible>) => bibles.map(BiblesOrgBible.toBible));
  }

  public getBible(bibleCode:string):Promise<Bible> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}.js`);
    return this.getResource(url, result => result.versions[0])
      .then(BiblesOrgBible.toBible);
  }

  public getBooks(bibleCode:string):Promise<Book[]> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}/books.js`);
    return this.getResource(url, result => result.books)
      .then((books:Array<BiblesOrgBook>) => books.map(BiblesOrgBook.toBook));
  }

  public getBook(bookCode:string):Promise<Book> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}.js`);
    return this.getResource(url, result => result.books[0])
      .then(BiblesOrgBook.toBook);
  }

  public getChapters(bookCode:string):Promise<Chapter[]> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}/chapters.js`);
    return this.getResource(url, result => result.chapters)
      .then((chapters:Array<BiblesOrgChapter>) => chapters.map(BiblesOrgChapter.toChapter));
  }

  public getChapter(chapterCode:string):Promise<Chapter> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}.js`);
    return this.getResource(url, result => result.chapters[0])
      .then(BiblesOrgChapter.toChapter);
  }

  public getVerses(chapterCode:string):Promise<Verse[]> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}/verses.js`);
    return this.getResource(url, result => result.verses)
      .then((verses:Array<BiblesOrgVerse>) => verses.map(BiblesOrgVerse.toVerse));
  }

  public getVerse(verseCode:string):Promise<Verse> {
    const url = URL.resolve(this.baseUrl, `verses/${verseCode}.js`);
    return this.getResource(url, result => result.verses[0])
      .then(BiblesOrgVerse.toVerse);
  }

  private getChapterCode(bibleCode:string, bookCode:string, chapterNumber:number):string {
    return bibleCode + ':' + bookCode + '.' + chapterNumber;
  }

}