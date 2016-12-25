'use strict';
import {CacheService} from "../../common/service/cacheService";
import * as URL from "url";
import {Book} from "../../book/book";
import {Bible} from "../../bible/bible";
import {Chapter} from "../../chapter/chapter";
import {Verse} from "../../verse/verse";
import {BiblesOrgBible} from "./biblesOrgBible";
import {BiblesOrgBook} from "./biblesOrgBook";
import {BiblesOrgChapter} from "./biblesOrgChapter";
import {BiblesOrgVerse} from "./biblesOrgVerse";
import {Config} from "../../common/config";
import {HttpClient} from "../../common/httpClient";
import {RemoteService} from "../../common/interface/remoteService";
import {Service, Optional, Logger, LoggerFactory} from "node-boot";

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
    this.baseUrl = config.find('api.biblesOrg.url');
  }

  private getResourceFromCache<T>(url: string): Promise<Optional<T>> {
    if (!this.cacheService) {
      return Promise.resolve(Optional.empty());
    }
    return this.cacheService.get(url)
      .then((value: Optional<T>) => {
        if (!value.isPresent()) {
          return value;
        }
        if (typeof value.get() === 'string') {
          return Optional.of(<T>JSON.parse(<any>value.get()));
        }
        return value;
      });
  }

  private saveToCache(url: string, resource: any): Promise<any> {
    if (resource) {
      return this.cacheService.set(url, resource, 5 * DAY_IN_MILLIS);
    }
    return Promise.resolve();
  }

  private async getResourceFromInternet<T>(url: string, filter: (any) => any): Promise<Optional<T>> {
    const self = this;
    this.logger.debug('Fetching resource from:', url);
    const remoteDataStr: string = await self.httpClient.get(url);
    const remoteData = JSON.parse(remoteDataStr || '{}');
    const result = filter(remoteData.response)
    self.saveToCache(url, result);
    return result;
  }

  private async getResource<T>(url: string, requestFilter: (any) => any): Promise<Optional<T>> {
    const remoteResource: any = await this.getResourceFromCache(url);
    return remoteResource ? Optional.of(remoteResource) : this.getResourceFromInternet(url, requestFilter);
  }

  public async getBibles(): Promise<Bible[]> {
    const url = URL.resolve(this.baseUrl, `versions.js`);
    const bibles: Optional<BiblesOrgBible[]> = <Optional<BiblesOrgBible[]>>await this.getResource(url, result => result.versions);
    return bibles.isPresent() ? bibles.get().map(BiblesOrgBible.toBible) : [];
  }

  public async getBible(bibleCode: string): Promise<Optional<Bible>> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}.js`);
    const remoteResource = await this.getResource(url, result => result.versions[0]);
    return remoteResource.isPresent() ? Optional.of(BiblesOrgBible.toBible(remoteResource.get())) : Optional.empty();
  }

  public async getBooks(bibleCode: string): Promise<Book[]> {
    const url = URL.resolve(this.baseUrl, `versions/${bibleCode}/books.js`);
    const books: Optional<BiblesOrgBook[]> = <Optional<BiblesOrgBook[]>>await this.getResource(url, result => result.books);
    return books.isPresent() ? books.get().map(BiblesOrgBook.toBook) : [];
  }

  public async getBook(bookCode: string): Promise<Optional<Book>> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}.js`);
    const remoteResource: Optional<BiblesOrgBook> = <Optional<BiblesOrgBook>>await this.getResource(url, result => result.books[0]);
    return remoteResource.isPresent() ? Optional.of(BiblesOrgBook.toBook(remoteResource.get())) : Optional.empty();
  }

  public async getChapters(bookCode: string): Promise<Chapter[]> {
    const url = URL.resolve(this.baseUrl, `books/${bookCode}/chapters.js`);
    const chapters: Optional<BiblesOrgChapter[]> = <Optional<BiblesOrgChapter[]>>await this.getResource(url, result => result.chapters);
    return chapters.isPresent() ? chapters.get().map(BiblesOrgChapter.toChapter).filter(c => !!c) : [];
  }

  public async getChapter(chapterCode: string): Promise<Optional<Chapter>> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}.js`);
    const remoteResource: Optional<BiblesOrgChapter> = <Optional<BiblesOrgChapter>>await this.getResource(url, result => result.chapters[0]);
    return remoteResource.isPresent() ? Optional.of(BiblesOrgChapter.toChapter(remoteResource.get())) : Optional.empty();
  }

  public async getVerses(chapterCode: string): Promise<Verse[]> {
    const url = URL.resolve(this.baseUrl, `chapters/${chapterCode}/verses.js`);
    const verses: Optional<BiblesOrgVerse[]> = <Optional<BiblesOrgVerse[]>>await this.getResource(url, result => result.verses);
    return verses.isPresent() ? verses.get().map(BiblesOrgVerse.toVerse).filter(c => !!c) : [];
  }

  public async getVerse(verseCode: string): Promise<Optional<Verse>> {
    const url = URL.resolve(this.baseUrl, `verses/${verseCode}.js`);
    const remoteResource: Optional<BiblesOrgVerse> = <Optional<BiblesOrgVerse>>await this.getResource(url, result => result.verses[0]);
    return remoteResource.isPresent() ? Optional.of(BiblesOrgVerse.toVerse(remoteResource.get())) : Optional.empty();
  }

  private getChapterCode(bibleCode: string, bookCode: string, chapterNumber: number): string {
    return bibleCode + ':' + bookCode + '.' + chapterNumber;
  }

}