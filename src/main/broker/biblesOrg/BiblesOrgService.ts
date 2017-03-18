'use strict';
import {CacheService} from "../../common/service/CacheService";
import * as URL from "url";
import {Book} from "../../book/Book";
import {Bible} from "../../bible/Bible";
import {Chapter} from "../../chapter/Chapter";
import {Verse} from "../../verse/Verse";
import {BiblesOrgBible} from "./BiblesOrgBible";
import {BiblesOrgBook} from "./BiblesOrgBook";
import {BiblesOrgChapter} from "./BiblesOrgChapter";
import {BiblesOrgVerse} from "./BiblesOrgVerse";
import {HttpClient} from "../../common/HttpClient";
import {RemoteService} from "../../common/interface/remoteService";
import {Service, Logger, LoggerFactory} from "node-boot";
import {Config} from "../../config/Config";

const DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

@Service
export class BiblesOrgService implements RemoteService {
  private baseUrl;
  private logger: Logger;

  constructor(private config: Config,
              private httpClient: HttpClient,
              private cacheService: CacheService,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger('BiblesOrgService');
    this.baseUrl = config.api.biblesOrg.url;
  }

  private async getResourceFromCache<T>(url: string): Promise<T> {
    if (!this.cacheService) {
      return null;
    }
    let cachedResource: T = <T>await this.cacheService.get(url);
    if (typeof cachedResource === 'string') {
      return <T>JSON.parse(<any>cachedResource);
    }
    return cachedResource;
  }

  private saveToCache(url: string, resource: any): Promise<any> {
    if (resource) {
      return this.cacheService.set(url, resource, 5 * DAY_IN_MILLIS);
    }
    return Promise.resolve();
  }

  private async getResourceFromInternet<T>(url: string, filter: (any) => any): Promise<T> {
    const self = this;
    this.logger.debug('Fetching resource from:', url);
    const remoteDataStr: string = await self.httpClient.get(url);
    const remoteData = JSON.parse(remoteDataStr || '{}');
    const result = filter(remoteData.response)
    self.saveToCache(url, result);
    return result;
  }

  private async getResource<T>(url: string, requestFilter: (any) => any): Promise<T> {
    const remoteResource: any = await this.getResourceFromCache(url);
    return remoteResource || this.getResourceFromInternet(url, requestFilter);
  }

  public async getBibles(): Promise<Bible[]> {
    const url = URL.resolve(this.baseUrl, `versions.js`);
    const bibles: BiblesOrgBible[] = <BiblesOrgBible[]>await this.getResource(url, result => result.versions);
    return (bibles || []) .map(BiblesOrgBible.toBible);
  }

  public async getBible(bibleCode: string): Promise<Bible> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}.js`);
    const remoteResource = await this.getResource(url, result => result.versions[0]);
    return remoteResource && BiblesOrgBible.toBible(remoteResource);
  }

  public async getBooks(bibleCode: string): Promise<Book[]> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}/books.js`);
    const books: BiblesOrgBook[] = <BiblesOrgBook[]>await this.getResource(url, result => result.books);
    return (books || []).map(BiblesOrgBook.toBook);
  }

  public async getBook(bookCode: string): Promise<Book> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}.js`);
    const remoteResource: BiblesOrgBook = <BiblesOrgBook>await this.getResource(url, result => result.books[0]);
    return remoteResource && BiblesOrgBook.toBook(remoteResource);
  }

  public async getChapters(bookCode: string): Promise<Chapter[]> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}/chapters.js`);
    const chapters: BiblesOrgChapter[] = <BiblesOrgChapter[]>await this.getResource(url, result => result.chapters);
    return (chapters || []).map(BiblesOrgChapter.toChapter).filter(c => !!c);
  }

  public async getChapter(chapterCode: string): Promise<Chapter> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}.js`);
    const remoteResource: BiblesOrgChapter = <BiblesOrgChapter>await this.getResource(url, result => result.chapters[0]);
    return remoteResource && BiblesOrgChapter.toChapter(remoteResource);
  }

  public async getVerses(chapterCode: string): Promise<Verse[]> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}/verses.js`);
    const verses: BiblesOrgVerse[] = <BiblesOrgVerse[]>await this.getResource(url, result => result.verses);
    return (verses || []).map(BiblesOrgVerse.toVerse).filter(c => !!c);
  }

  public async getVerse(verseCode: string): Promise<Verse> {
    const url = URL.resolve(this.baseUrl, `verses/${verseCode}.js`);
    const remoteResource: BiblesOrgVerse = <BiblesOrgVerse>await this.getResource(url, result => result.verses[0]);
    return remoteResource && BiblesOrgVerse.toVerse(remoteResource);
  }

  private getChapterCode(bibleCode: string, bookCode: string, chapterNumber: number): string {
    return bibleCode + ':' + bookCode + '.' + chapterNumber;
  }

}