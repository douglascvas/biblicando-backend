'use strict';

import * as Sinon from "sinon";
import {assert} from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {Bible} from "../../../main/bible/Bible";
import {BibleDao} from "../../../main/bible/BibleDao";
import {Config} from "../../../main/config/Config";
import {ConfigTest} from "../../ConfigTest";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";
import {BibleResourceFetcher} from "../../../main/bible/BibleResourceFetcher";
import SinonStub = Sinon.SinonStub;
import SinonMatch = Sinon.SinonMatch;

describe('BibleResourceFetcher', function () {

  let config: Config;
  let bibleDao: BibleDao;
  let resourceManager: ResourceManager;
  let bibleResourceFetcher: BibleResourceFetcher;
  let loggerFactory: LoggerFactory;

  beforeEach(() => {
    config = new ConfigTest();
    resourceManager = Sinon.createStubInstance(ResourceManager);
    bibleDao = Sinon.createStubInstance(BibleDao);
    loggerFactory = new TestLoggerFactory();
    bibleResourceFetcher = new BibleResourceFetcher(bibleDao, config, resourceManager);
  });

  describe('#fetchBibles()', function () {
    it('should fetch the bibles from the server', async function () {
      // given
      const bibles: Bible[] = [new Bible()];
      (<SinonStub>resourceManager.getResources).returns(Promise.resolve(bibles));

      // when
      await bibleResourceFetcher.fetchBibles();

      // then
      assert.isTrue((<SinonStub>resourceManager.getResources).calledWith('', 'bibles', Sinon.match.any));

      // given
      const calledArg = (<any>resourceManager.getResources).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<SinonStub>bibleDao.find).withArgs(config.bible.filter, Sinon.match.any).calledOnce);
    });
  });

  describe('#fetchBible()', function () {
    it('should fetch the bible from the server', async function () {
      // given
      const bibles: Bible[] = [new Bible()];
      const bibleId: string = '123';
      (<SinonStub>resourceManager.getResource).returns(Promise.resolve(bibles));

      // when
      await bibleResourceFetcher.fetchBible(bibleId);

      // then
      assert.isTrue((<SinonStub>resourceManager.getResource).calledWith(bibleId, 'bible', Sinon.match.any));

      // given
      const calledArg = (<any>resourceManager.getResource).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<SinonStub>bibleDao.findOne).withArgs(bibleId).calledOnce);
    });
  });

});