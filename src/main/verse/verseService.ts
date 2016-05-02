'use strict';

namespace verse {
  import Inject = common.Inject;
  const assert = require('assert');

  @Inject
  export class VerseService {

    constructor(private config,
                private httpClient,
                private cacheService,
                private verseDao,
                private chapterDao,
                private remoteApiInfoService) {
    }

    public getVerses(chapterId) {
      return this.cacheService.getFromCache(`verses_${chapterId}`)
        .then(verses => verses ? verses : this.verseDao.findByChapter(chapterId))
        .then(verses => this.storeVersesInCache(chapterId, verses))
        .then(verses => verses ? verses : this.fetchVersesRemotelyAndSaveInCache(chapterId));
    }

    public getVerse(verseId) {
      return this.cacheService.getFromCache(`verse_${verseId}`)
        .then(verse => verse ? verse : this.verseDao.findOne(verseId))
        .then(this.storeVerseInCache);
    }

    private fetchVersesRemotely(chapterId, chapter) {
      if (!chapter.remoteSource) {
        console.log(`No verse found for chapter '${chapterId}'.`);
        return [];
      }
      let remoteApiInfo = this.remoteApiInfoService.resolveFromName(chapter.remoteSource);
      assert(remoteApiInfo, `No service found for fetching chapter ${chapterId}.`);
      let RemoteService = remoteApiInfo.serviceClass;
      let remoteService = new RemoteService(this.config, this.httpClient, this.cacheService);
      return remoteService.getVerses(chapter.remoteId)
        .then(verses=>this.storeVersesInCache(chapterId, verses));
    }

    private storeVersesInCache(chapterId, verses) {
      if (!verses || !verses.length) {
        return verses;
      }
      let timeout = this.config.get('cache.expirationInMillis');
      this.cacheService.storeInCache(`verses_${chapterId}`, verses, timeout);
      return verses;
    }

    private storeVerseInCache(verse) {
      if (!verse || !verse._id) {
        return verse;
      }
      let timeout = this.config.get('cache.expirationInMillis');
      this.cacheService.storeInCache(`verse_${verse._id.toString()}`, verse, timeout);
      return verse;
    }

    private fetchVersesRemotelyAndSaveInCache(chapterId) {
      return this.chapterDao.findOne(chapterId)
        .then(chapter=> this.fetchVersesRemotely(chapterId, chapter));
    }
  }


}