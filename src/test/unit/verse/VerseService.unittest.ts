'use strict';

import {VerseService} from "../../../main/verse/VerseService";
import * as Sinon from "sinon";
import {assert} from "chai";
import {Verse} from "../../../main/verse/Verse";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";
import {VerseResourceFetcher} from "../../../main/verse/VerseResourceFetcher";

describe('VerseService', function () {

  let verseService: VerseService;
  let loggerFactory: LoggerFactory;
  let verseResourceFetcher: VerseResourceFetcher;

  beforeEach(() => {
    verseResourceFetcher = Sinon.createStubInstance(VerseResourceFetcher);
    loggerFactory = new TestLoggerFactory();
    verseService = new VerseService(verseResourceFetcher, loggerFactory);
  });

  describe('#getVerse()', function () {
    it('should return empty if no verse id is given', async function () {
      // when
      const verse: Verse = await verseService.findVerse(null);

      // then
      assert.isNull(verse);
    });

    it('should fetch the verse from remote', async function () {
      // given
      const verse: Verse = aVerseWithNumber(1);

      const verseId: string = 'verse1';
      (<Sinon.SinonStub>verseResourceFetcher.fetchVerse).withArgs(verseId).returns(Promise.resolve(verse));

      // when
      let result: Verse = await verseService.findVerse(verseId);

      // then
      assert.strictEqual(result, verse);
    });

  });

  describe('#getVerses()', function () {
    it('should return empty if no chapter id is given', async function () {
      // when
      const verses: Verse[] = await verseService.findVersesForChapter(null);

      // then
      assert.equal(verses.length, 0);
    });

    it('should fetch the verses from remote and sort by number', async function () {
      // given
      const verse1: Verse = aVerseWithNumber(1);
      const verse2: Verse = aVerseWithNumber(2);
      const verses: Verse[] = [verse2, verse1];

      const chapterId: string = '123';
      (<Sinon.SinonStub>verseResourceFetcher.fetchVerses).withArgs(chapterId).returns(Promise.resolve(verses));

      // when
      let result: Verse[] = await verseService.findVersesForChapter(chapterId);

      // then
      assert.strictEqual(result.length, verses.length);
      assert.strictEqual(result[0], verse1);
      assert.strictEqual(result[1], verse2);
    });

  });

  function aVerseWithNumber(verseNumber: number): Verse {
    let verse: Verse = new Verse();
    verse._id = 'id' + verseNumber;
    verse.numbers = [verseNumber];
    return verse;
  }

});