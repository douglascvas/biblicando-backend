'use strict';
import {CacheService} from "../common/service/cacheService";
import {ChapterDao} from "./chapterDao";
import {BookDao} from "../book/bookDao";
import {Inject} from "../common/decorators/inject";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Promise} from "../common/interface/promise";
import {Chapter} from "./chapter";
import {Book} from "../book/book";
import * as Q from "q";
import * as assert from "assert";

@Inject
export class ChapterService {
  constructor(private config,
              private httpClient,
              private cacheService:CacheService,
              private chapterDao:ChapterDao,
              private bookDao:BookDao,
              private remoteApiInfoService:RemoteApiInfoService) {

  }

  public getChapters(bookId:string):Promise<Chapter[]> {
    return this.cacheService.get(`chapters_${bookId}`)
      .then(chapters=> chapters ? chapters : this.chapterDao.findByBook(bookId))
      .then(chapters=>this.storeChaptersInCache(bookId, chapters))
      .then(chapters=> chapters.length ? chapters : this.fetchChaptersRemotelyAndSave(bookId));
  }

  public getChapter(chapterId:string):Promise<Chapter> {
    return this.cacheService.get(`chapter_${chapterId}`)
      .then(chapter=> chapter ? chapter : this.chapterDao.findOne(chapterId))
      .then(chapter => this.storeChapterInCache(chapter));
  }

  private fetchChaptersRemotely(bookId, book):Promise<Chapter[]> {
    if (!book || !book.remoteSource) {
      console.log(`No chapter found for book '${bookId}'.`);
      return Promise.resolve([]);
    }
    let remoteApiInfo = this.remoteApiInfoService.resolveFromName(book.remoteSource);
    assert(remoteApiInfo, `No service found for fetching book ${bookId}.`);
    let RemoteService:any = remoteApiInfo.serviceClass;
    let remoteService = new RemoteService(this.config, this.httpClient, this.cacheService);
    return remoteService.getChapters(book.remoteId)
      .then(chapters=> this.storeChaptersInCache(bookId, chapters));
  }

  private  storeChaptersInCache(bookId:string, chapters:Chapter[]):Chapter[] {
    if (!chapters || !chapters.length) {
      return chapters;
    }
    let timeout = this.config.get('cache.expirationInMillis');
    this.cacheService.set(`chapters_${bookId}`, chapters, timeout);
    return chapters;
  }

  private  storeChapterInCache(chapter:Chapter):Chapter {
    if (!chapter || !chapter._id) {
      return chapter;
    }
    let timeout = this.config.get('cache.expirationInMillis');
    this.cacheService.set(`chapter_${chapter._id.toString()}`, chapter, timeout);
    return chapter;
  }

  private insertChaptersInDatabase(chapters:Chapter[], bookId:string):Promise<Chapter[]> {
    const self = this;
    var updatedResources:Promise<any>[] = chapters.map((chapter:Chapter) => {
      chapter.book = <Book>{_id: bookId.toString()};
      return self.chapterDao.upsertOne(chapter);
    });
    return Promise.all(updatedResources)
      .then(dbResults=> {
        var ids = dbResults.map(result => result.insertedId);
        return self.chapterDao.find({_id: {$in: ids}}, {});
      });
  }

  private  fetchChaptersRemotelyAndSave(bookId:string):Promise<Chapter[]> {
    return this.bookDao.findOne(bookId)
      .then(book=> this.fetchChaptersRemotely(bookId, book))
      .then(chapters=> chapters.length ? this.insertChaptersInDatabase(chapters, bookId) : chapters);
  }
}
