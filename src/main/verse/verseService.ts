'use strict';
import {Inject} from "../common/decorators/inject";
import {CacheService} from "../common/service/cacheService";
import {VerseDao} from "./verseDao";
import {ChapterDao} from "../chapter/chapterDao";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Verse} from "./verse";
import {Chapter} from "../chapter/chapter";
import * as Q from "q";
import IPromise = Q.IPromise;
import * as assert from "assert";

@Inject()
export class VerseService {

  constructor(private config,
              private httpClient,
              private cacheService:CacheService,
              private verseDao:VerseDao,
              private chapterDao:ChapterDao,
              private remoteApiInfoService:RemoteApiInfoService) {
  }

  public getVerses(chapterId:string):IPromise<Verse[]> {
    return this.cacheService.getFromCache(`verses_${chapterId}`)
      .then(verses => verses ? verses : this.verseDao.findByChapter(chapterId))
      .then(verses => this.storeVersesInCache(chapterId, verses))
      .then(verses => verses ? verses : this.fetchVersesRemotelyAndSaveInCache(chapterId));
  }

  public getVerse(verseId:string):IPromise<Verse> {
    return this.cacheService.getFromCache(`verse_${verseId}`)
      .then(verse => verse ? verse : this.verseDao.findOne(verseId))
      .then(this.storeVerseInCache);
  }

  private fetchVersesRemotely(chapterId:string, chapter:Chapter):IPromise<Verse[]> {
    if (!chapter.remoteSource) {
      console.log(`No verse found for chapter '${chapterId}'.`);
      return Q.when([]);
    }
    let remoteApiInfo = this.remoteApiInfoService.resolveFromName(chapter.remoteSource);
    assert(remoteApiInfo, `No service found for fetching chapter ${chapterId}.`);
    let RemoteService: any = remoteApiInfo.serviceClass;
    let remoteService = new RemoteService(this.config, this.httpClient, this.cacheService);
    return remoteService.getVerses(chapter.remoteId)
      .then(verses=>this.storeVersesInCache(chapterId, verses));
  }

  private storeVersesInCache(chapterId:string, verses:Verse[]):Verse[] {
    if (!verses || !verses.length) {
      return verses;
    }
    let timeout = this.config.get('cache.expirationInMillis');
    this.cacheService.saveToCache(`verses_${chapterId}`, verses, timeout);
    return verses;
  }

  private storeVerseInCache(verse:Verse):Verse {
    if (!verse || !verse._id) {
      return verse;
    }
    let timeout = this.config.get('cache.expirationInMillis');
    this.cacheService.saveToCache(`verse_${verse._id.toString()}`, verse, timeout);
    return verse;
  }

  private fetchVersesRemotelyAndSaveInCache(chapterId:string):IPromise<Verse[]> {
    return this.chapterDao.findOne(chapterId)
      .then(chapter=> this.fetchVersesRemotely(chapterId, chapter));
  }
}
