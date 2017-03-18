'use strict';

import {ChapterService} from "../../../main/chapter/ChapterService";
import * as Sinon from "sinon";
import {assert} from "chai";
import {Chapter} from "../../../main/chapter/Chapter";
import {VerseService} from "../../../main/verse/VerseService";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";
import {ChapterResourceFetcher} from "../../../main/chapter/ChapterResourceFetcher";
import {Verse} from "../../../main/verse/Verse";

describe('ChapterService', function () {

  let chapterService: ChapterService;
  let verseService: VerseService;
  let loggerFactory: LoggerFactory;
  let chapterResourceFetcher: ChapterResourceFetcher;

  beforeEach(() => {
    chapterResourceFetcher = Sinon.createStubInstance(ChapterResourceFetcher);
    verseService = Sinon.createStubInstance(VerseService);
    loggerFactory = new TestLoggerFactory();
    chapterService = new ChapterService(verseService, chapterResourceFetcher, loggerFactory);
  });

  describe('#findChapter()', function () {
    it('should return empty if no chapter id is given', async function () {
      // when
      const chapter: Chapter = await chapterService.findChapter(null);

      // then
      assert.isNull(chapter);
    });

    it('should fetch the chapter from remote', async function () {
      // given
      const chapter: Chapter = aChapterWithNumber(1);

      const chapterId: string = 'chapter1';
      (<Sinon.SinonStub>chapterResourceFetcher.fetchChapter).withArgs(chapterId).returns(Promise.resolve(chapter));

      // when
      let result: Chapter = await chapterService.findChapter(chapterId);

      // then
      assert.strictEqual(result, chapter);
    });

    it('should load verses for chapter', async function () {
      // given
      const chapter: Chapter = aChapterWithNumber(1);
      const verses: Verse[] = [new Verse()];

      const chapterId: string = 'chapter1';
      (<Sinon.SinonStub>chapterResourceFetcher.fetchChapter).withArgs(chapterId).returns(Promise.resolve(chapter));
      (<Sinon.SinonStub>verseService.findVersesForChapter).withArgs(chapter._id).returns(Promise.resolve(verses));

      // when
      let result: Chapter = await chapterService.findChapter(chapterId);

      // then
      assert.strictEqual(result.verses, verses);
    });
  });

  describe('#findChaptersForBook()', function () {
    it('should return empty if no book id is given', async function () {
      // when
      const chapters: Chapter[] = await chapterService.findChaptersForBook(null);

      // then
      assert.equal(chapters.length, 0);
    });

    it('should fetch the chapters from remote and sort by number', async function () {
      // given
      const chapter1: Chapter = aChapterWithNumber(1);
      const chapter2: Chapter = aChapterWithNumber(2);
      const chapters: Chapter[] = [chapter2, chapter1];

      const bookId: string = '123';
      (<Sinon.SinonStub>chapterResourceFetcher.fetchChapters).withArgs(bookId).returns(Promise.resolve(chapters));

      // when
      let result: Chapter[] = await chapterService.findChaptersForBook(bookId);

      // then
      assert.strictEqual(result.length, chapters.length);
      assert.strictEqual(result[0], chapter1);
      assert.strictEqual(result[1], chapter2);
    });

    it('should fetch the verse for the first chapter', async function () {
      // given
      const chapter1: Chapter = aChapterWithNumber(1);
      const chapter2: Chapter = aChapterWithNumber(2);
      const chapters: Chapter[] = [chapter2, chapter1];
      const verses: Verse[] = [new Verse()];

      const bookId: string = '123';
      (<Sinon.SinonStub>chapterResourceFetcher.fetchChapters).withArgs(bookId).returns(Promise.resolve(chapters));
      (<Sinon.SinonStub>verseService.findVersesForChapter).withArgs(chapter1._id).returns(Promise.resolve(verses));

      // when
      let result: Chapter[] = await chapterService.findChaptersForBook(bookId);

      // then
      assert.strictEqual(result[0].verses.length, 1);
      assert.strictEqual(result[0].verses, verses);
      assert.strictEqual(result[1].verses.length, 0);
    });
  });

  function aChapterWithNumber(chapterNumber: number): Chapter {
    let chapter: Chapter = new Chapter();
    chapter._id = 'id' + chapterNumber;
    chapter.number = chapterNumber;
    chapter.verses = [];
    return chapter;
  }

});