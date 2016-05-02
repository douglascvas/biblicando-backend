'use strict';

const assert = require('assert');
const Q = require('q');

function ChapterService(config, httpClient, cacheService, chapterDao, bookDao, remoteApiInfoService) {
  this.getChapters = getChapters;
  this.getChapter = getChapter;

  function getChapters(bookId) {
    return cacheService.getFromCache(`chapters_${bookId}`)
      .then(chapters=> chapters ? chapters : chapterDao.findByBook(bookId))
      .then(chapters=>storeChaptersInCache(bookId, chapters))
      .then(chapters=> chapters ? chapters : fetchChaptersRemotelyAndSave(bookId));
  }

  function getChapter(chapterId) {
    return cacheService.getFromCache(`chapter_${chapterId}`)
      .then(chapter=> chapter ? chapter : chapterDao.findOne(chapterId))
      .then(storeChapterInCache);
  }

  function fetchChaptersRemotely(bookId, book) {
    if (!book.remoteSource) {
      console.log(`No chapter found for book '${bookId}'.`);
      return [];
    }
    let remoteApiInfo = remoteApiInfoService.resolveFromName(book.remoteSource);
    assert(remoteApiInfo, `No service found for fetching book ${bookId}.`);
    let RemoteService = remoteApiInfo.serviceClass;
    let remoteService = new RemoteService(config, httpClient, cacheService);
    return remoteService.getChapters(book.remoteId)
      .then(chapters=> storeChaptersInCache(bookId, chapters));
  }

  function storeChaptersInCache(bookId, chapters) {
    if (!chapters || !chapters.length) {
      return chapters;
    }
    let timeout = config.get('cache.expirationInMillis');
    cacheService.storeInCache(`chapters_${bookId}`, chapters, timeout);
    return chapters;
  }

  function storeChapterInCache(chapter) {
    if (!chapter || !chapter._id) {
      return chapter;
    }
    let timeout = config.get('cache.expirationInMillis');
    cacheService.storeInCache(`chapter_${chapter._id.toString()}`, chapter, timeout);
    return chapter;
  }

  function insertChaptersInDatabase(chapters, bookId) {
    const self = this;
    var updatedResources = chapters.map(chapter => {
      chapter.book = {id: bookId.toString()};
      return chapterDao.upsertOne(chapter);
    });
    return Q.all(updatedResources)
      .then(dbResults=> {
        var ids = dbResults.map(result => result.upsertedId);
        return chapterDao.find({_id: {$in: ids}});
      });
  }

  function fetchChaptersRemotelyAndSave(bookId) {
    return bookDao.findOne(bookId)
      .then(book=> fetchChaptersRemotely(bookId, book))
      .then(chapters=> chapters.length ? insertChaptersInDatabase(chapters, bookId) : chapters);
  }
}

ChapterService.$inject = true;

module.exports = ChapterService;