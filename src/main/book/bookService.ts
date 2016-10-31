'use strict';
import {Inject} from "../common/decorators/inject";
import {CacheService} from "../common/service/cacheService";
import {BookDao} from "./bookDao";
import {BibleDao} from "../bible/bibleDao";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Promise} from "../common/interface/promise";
import {Book} from "./book";
import {Bible} from "../bible/bible";
import * as assert from "assert";
import {LoggerFactory, Logger} from "../common/loggerFactory";
import {ChapterService} from "../chapter/chapterService";
import {Chapter} from "../chapter/chapter";
import {Config} from "../common/config";
import {HttpClient} from "../common/httpClient";

@Inject
export class BookService {

  private logger:Logger;

  constructor(private config:Config,
              private httpClient:HttpClient,
              private cacheService:CacheService,
              private bookDao:BookDao,
              private bibleDao:BibleDao,
              private chapterService:ChapterService,
              private remoteApiInfoService:RemoteApiInfoService,
              private loggerFactory:LoggerFactory) {
    this.logger = loggerFactory.getLogger(BookService);
  }

  public getBooks(bibleId:string):Promise<Book[]> {
    if (!bibleId) {
      return Promise.resolve([]);
    }
    return this.cacheService.get(`books_${bibleId}`)
      .then(books=> books ? books : this.bookDao.findByBible(bibleId))
      .then(books=>this.storeBooksInCache(bibleId, books))
      .then(books=> books && books.length ? books : this.fetchBooksRemotelyAndSave(bibleId));
  }

  public getBook(bookId:string):Promise<Book> {
    return this.cacheService.get(`book_${bookId}`)
      .then(book=> book ? book : this.bookDao.findOne(bookId))
      .then(book => this.storeBookInCache(book));
  }

  /**
   * Initialize the book, filling it up with it's chapters.
   *
   * @method loadFromBible
   *
   * @param bibleId
   * @returns {Promise<Book[]>}
   */
  public loadFromBible(bibleId:string):Promise<Book[]> {
    var self:BookService = this;
    return self.getBooks(bibleId)
      .then(books=>books || [])
      .then((books:Book[])=>books.sort((a:Book, b:Book)=>a.number - b.number))
      .then((books:Book[])=> {
        return books.length ? [books, self.chapterService.loadFromBook(books[0]._id)] : [books, []];
      })
      .spread((books:Book[], chapters:Chapter[]) => {
        if (books.length) {
          books[0].chapters = chapters;
        }
        return books;
      })
      .then((books:Book[])=>books);
  }

  private fetchBooksRemotely(bibleId:string, bible:Bible) {
    if (!bible || !bible.remoteSource) {
      this.logger.warn(`No book found for bible '${bibleId}'.`);
      return [];
    }
    let remoteService = this.remoteApiInfoService.getService(bible.remoteSource);
    assert(remoteService, `No service found for fetching bible ${bibleId}.`);
    return remoteService.getBooks(bible.remoteId)
      .then(books=> this.storeBooksInCache(bibleId, books));
  }

  private  storeBooksInCache(bibleId:string, books:Book[]) {
    if (!books || !books.length) {
      return books;
    }
    let timeout = this.config.find('cache.expirationInMillis');
    this.cacheService.set(`books_${bibleId}`, books, timeout);
    return books;
  }

  private storeBookInCache(book:Book):Book {
    if (!book || !book._id) {
      return book;
    }
    let timeout = this.config.find('cache.expirationInMillis');
    this.cacheService.set(`book_${book._id.toString()}`, book, timeout);
    return book;
  }

  private  insertBooksInDatabase(books:Book[], bibleId:string):Promise<Book[]> {
    const self = this;
    var updatedResources:Promise<Book>[] = books.map((book:Book) => {
      book.bible = <Bible>{_id: bibleId.toString()};
      return this.bookDao.upsertOne(book);
    });
    var result = Promise.all(updatedResources)
      .then(dbResults => {
        var ids:any[] = dbResults.map((result:Book) => result._id);
        return this.bookDao.find({_id: {$in: ids}}, {});
      });
    return <Promise<Book[]>>result;
  }

  private  fetchBooksRemotelyAndSave(bibleId:string):Promise<Book[]> {
    return this.bibleDao.findOne(bibleId)
      .then((bible:Bible)=> this.fetchBooksRemotely(bibleId, bible))
      .then(books=> books.length ? this.insertBooksInDatabase(books, bibleId) : books);
  }
}