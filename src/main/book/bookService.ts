'use strict';
import {Inject} from "../common/decorators/inject";
import {CacheService} from "../common/service/cacheService";
import {BookDao} from "./bookDao";
import {BibleDao} from "../bible/bibleDao";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Book} from "./book";
import {Bible} from "../bible/bible";
import * as Q from "q";
import IPromise = Q.IPromise;

@Inject()
export class BookService {

  constructor(private config,
              private httpClient,
              private cacheService:CacheService,
              private bookDao:BookDao,
              private bibleDao:BibleDao,
              private remoteApiInfoService:RemoteApiInfoService) {

  }

  public getBooks(bibleId:string):IPromise<Book[]> {
    return this.cacheService.getFromCache(`books_${bibleId}`)
      .then(books=> books ? books : this.bookDao.findByBible(bibleId))
      .then(books=>this.storeBooksInCache(bibleId, books))
      .then(books=> books ? books : this.fetchBooksRemotelyAndSave(bibleId));
  }

  public getBook(bookId:string):IPromise<Book> {
    return this.cacheService.getFromCache(`book_${bookId}`)
      .then(book=> book ? book : this.bookDao.findOne(bookId))
      .then(this.storeBookInCache);
  }

  private fetchBooksRemotely(bibleId:string, bible:Bible) {
    if (!bible.remoteSource) {
      console.log(`No book found for bible '${bibleId}'.`);
      return [];
    }
    let remoteApiInfo = this.remoteApiInfoService.resolveFromName(bible.remoteSource);
    assert(remoteApiInfo, `No service found for fetching bible ${bibleId}.`);
    let RemoteService:any = remoteApiInfo.serviceClass;
    let remoteService = new RemoteService(this.config, this.httpClient, this.cacheService);
    return remoteService.getBooks(bible.remoteId)
      .then(books=> this.storeBooksInCache(bibleId, books));
  }

  private  storeBooksInCache(bibleId:string, books:Book[]) {
    if (!books || !books.length) {
      return books;
    }
    let timeout = this.config.get('cache.expirationInMillis');
    this.cacheService.storeInCache(`books_${bibleId}`, books, timeout);
    return books;
  }

  private  storeBookInCache(book:Book):Book {
    if (!book || !book._id) {
      return book;
    }
    let timeout = this.config.get('cache.expirationInMillis');
    this.cacheService.storeInCache(`book_${book._id.toString()}`, book, timeout);
    return book;
  }

  private  insertBooksInDatabase(books:Book[], bibleId:string):IPromise<Book[]> {
    const self = this;
    var updatedResources = books.map(book => {
      book.bible = <Bible>{_id: bibleId.toString()};
      return this.bookDao.upsertOne(book);
    });
    return Q.all(updatedResources)
      .then(dbResults=> {
        var ids = dbResults.map(result => result.upsertedId);
        return this.bookDao.find({_id: {$in: ids}}, {});
      });
  }

  private  fetchBooksRemotelyAndSave(bibleId:string):IPromise<Book[]> {
    return this.bibleDao.findOne(bibleId)
      .then((bible:Bible)=> this.fetchBooksRemotely(bibleId, bible))
      .then(books=> books.length ? this.insertBooksInDatabase(books, bibleId) : books);
  }
}