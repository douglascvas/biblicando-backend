'use strict';

import {VerseService} from "../../../main/verse/verseService";
import * as sinon from "sinon";
import * as chai from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {RemoteApiInfoService} from "../../../main/common/service/RemoteApiInfoService";
import {Verse} from "../../../main/verse/verse";
import {VerseDao} from "../../../main/verse/verseDao";
import {ChapterDao} from "../../../main/chapter/ChapterDao";

const assert = chai.assert;

describe('VerseService', function () {

  let verseDao: VerseDao;
  let chapterDao: ChapterDao;
  let resourceManager: ResourceManager;
  let verseService: VerseService;
  let remoteApiInfoService: RemoteApiInfoService;

  function spy() {
    return sinon.spy();
  }

  function stub() {
    return sinon.stub();
  }

  beforeEach(() => {
    chapterDao = <any>{find: spy(), findOne: spy()};
    resourceManager = <any>{getResources: stub(), getResource: stub()};
    verseDao = <any>{findByChapter: spy(), findOne: spy()};
    remoteApiInfoService = <any>{resolveFromName: spy()};
    verseService = new VerseService(verseDao, chapterDao, remoteApiInfoService, resourceManager);
  });

  describe('#getVerses()', function () {
    it('should return empty if chapter id is null', async function () {
      // when
      const verses: Verse[] = await verseService.getVerses(null);

      // then
      assert.equal(verses.length, 0);
    });

    it('should return verses from resource manager', async function () {
      // given
      const verses: Verse[] = [new Verse()];
      (<any>resourceManager.getResources).withArgs().returns(Promise.resolve(verses));

      // when
      const result: Verse[] = await verseService.getVerses('123');

      // then
      assert.equal(result, verses);
    });

    it('should get verses for the chapter from the database if necessary', async function () {
      // given
      const verses: Verse[] = [new Verse()];
      (<any>resourceManager.getResources).returns(Promise.resolve(verses));

      // when
      await verseService.getVerses('123');

      // then
      assert.equal((<any>verseDao.findByChapter).callCount, 0);

      // given
      const calledArg = (<any>resourceManager.getResources).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<any>verseDao.findByChapter).calledOnce);
    });
  });

});