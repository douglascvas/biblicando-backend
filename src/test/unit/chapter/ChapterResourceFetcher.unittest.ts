'use strict';

import * as Sinon from "sinon";
import {assert} from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {Chapter} from "../../../main/chapter/Chapter";
import {ChapterDao} from "../../../main/chapter/ChapterDao";
import {Config} from "../../../main/config/Config";
import {ConfigTest} from "../../ConfigTest";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";
import {ChapterResourceFetcher} from "../../../main/chapter/ChapterResourceFetcher";
import SinonStub = Sinon.SinonStub;
import SinonMatch = Sinon.SinonMatch;

describe('ChapterResourceFetcher', function () {
  let config: Config;
  let chapterDao: ChapterDao;
  let resourceManager: ResourceManager;
  let chapterResourceFetcher: ChapterResourceFetcher;
  let loggerFactory: LoggerFactory;

  beforeEach(() => {
    config = new ConfigTest();
    resourceManager = Sinon.createStubInstance(ResourceManager);
    chapterDao = Sinon.createStubInstance(ChapterDao);
    loggerFactory = new TestLoggerFactory();
    chapterResourceFetcher = new ChapterResourceFetcher(chapterDao, resourceManager);
  });

  describe('#fetchChapters()', function () {
    it('should fetch the chapters from the server', async function () {
      // given
      const books: Chapter[] = [new Chapter()];
      const bookId: string = '123';
      (<SinonStub>resourceManager.getResources).returns(Promise.resolve(books));

      // when
      await chapterResourceFetcher.fetchChapters(bookId);

      // then
      assert.isTrue((<SinonStub>resourceManager.getResources).calledWith(bookId, 'chapters', Sinon.match.any));

      // given
      const calledArg = (<any>resourceManager.getResources).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<SinonStub>chapterDao.findByBook).withArgs(bookId).calledOnce);
    });
  });

  describe('#fetchChapter()', function () {
    it('should fetch the chapter from the server', async function () {
      // given
      const books: Chapter[] = [new Chapter()];
      const chapterId: string = '123';
      (<SinonStub>resourceManager.getResource).returns(Promise.resolve(books));

      // when
      await chapterResourceFetcher.fetchChapter(chapterId);

      // then
      assert.isTrue((<SinonStub>resourceManager.getResource).calledWith(chapterId, 'chapter', Sinon.match.any));

      // given
      const calledArg = (<any>resourceManager.getResource).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<SinonStub>chapterDao.findOne).withArgs(chapterId).calledOnce);
    });
  });

});