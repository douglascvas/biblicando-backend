'use strict';
import {CacheService} from "../common/service/cacheService";
import {ChapterDao} from "./chapterDao";
import {BookDao} from "../book/bookDao";
import {Inject} from "../common/decorators/inject";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Promise} from "../common/interface/promise";
import {Chapter} from "./chapter";
import {Book} from "../book/book";
import * as assert from "assert";
import {VerseService} from "../verse/verseService";
import {Verse} from "../verse/verse";
import {Config} from "../common/config";
import {HttpClient} from "../common/httpClient";
import {DependencyInjector} from "../common/service/dependencyInjector";

@Inject
export class ChapterService {
  constructor(private config:Config,
              private cacheService:CacheService,
              private chapterDao:ChapterDao,
              private bookDao:BookDao,
              private verseService:VerseService,
              private remoteApiInfoService:RemoteApiInfoService) {

  }

  /**
   * Load the chapters, filling up the first one of the list with it's verses.
   *
   * @method loadFromBook
   *
   * @param bookId
   * @returns {Promise<Book>}
   */
  public loadFromBook(bookId:string):Promise<Chapter[]> {
    var self:ChapterService = this;
    return self.getChapters(bookId)
      .then(chapters=>chapters || [])
      .then((chapters:Chapter[])=>chapters.sort((a:Chapter, b:Chapter)=>a.number - b.number))
      .then((chapters:Chapter[])=> {
        return chapters.length ? [chapters, self.verseService.getVerses(chapters[0]._id)] : [chapters, []];
      })
      .spread((chapters:Chapter[], verses:Verse[]) => {
        if (chapters.length) {
          chapters[0].verses = verses;
        }
        return chapters;
      })
      .then((chapters:Chapter[])=>chapters);
  }

  public getChapters(bookId:string):Promise<Chapter[]> {
    if (!bookId) {
      return Promise.resolve([]);
    }
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
    let remoteService = this.remoteApiInfoService.getService(book.remoteSource);
    assert(remoteService, `No service found for fetching book ${bookId}.`);
    return remoteService.getChapters(book.remoteId)
      .then(chapters=> this.storeChaptersInCache(bookId, chapters));
  }

  private  storeChaptersInCache(bookId:string, chapters:Chapter[]):Chapter[] {
    if (!chapters || !chapters.length) {
      return chapters;
    }
    let timeout = this.config.find('cache.expirationInMillis');
    this.cacheService.set(`chapters_${bookId}`, chapters, timeout);
    return chapters;
  }

  private  storeChapterInCache(chapter:Chapter):Chapter {
    if (!chapter || !chapter._id) {
      return chapter;
    }
    let timeout = this.config.find('cache.expirationInMillis');
    this.cacheService.set(`chapter_${chapter._id.toString()}`, chapter, timeout);
    return chapter;
  }

  private insertChaptersInDatabase(chapters:Chapter[], bookId:string):Promise<Chapter[]> {
    const self = this;
    var updatedResources:Promise<Chapter>[] = chapters.map((chapter:Chapter) => {
      chapter.book = <Book>{_id: bookId.toString()};
      return self.chapterDao.upsertOne(chapter);
    });
    var result = Promise.all(updatedResources)
      .then(dbResults=> {
        var ids = dbResults
          .map((result:Chapter) => result._id)
          .filter(id=>!!id);
        if (!ids.length) {
          return <Chapter[]>[]
        }
        return self.chapterDao.find({_id: {$in: ids}}, {});
      });
    return <Promise<Chapter[]>>result;
  }

  private  fetchChaptersRemotelyAndSave(bookId:string):Promise<Chapter[]> {
    return this.bookDao.findOne(bookId)
      .then(book=> this.fetchChaptersRemotely(bookId, book))
      .then(chapters=> chapters.length ? this.insertChaptersInDatabase(chapters, bookId) : chapters)
      .then(chapters=>this.storeChaptersInCache(bookId, chapters));
  }
}
