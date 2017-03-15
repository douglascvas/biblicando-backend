'use strict';

import {BibleService} from "../../../main/bible/BibleService";
import * as Sinon from "sinon";
import {assert} from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {Bible} from "../../../main/bible/Bible";
import {BibleDao} from "../../../main/bible/BibleDao";
import {Config} from "../../../main/config/Config";
import {ConfigTest} from "../../ConfigTest";


describe('BibleService', function () {

  let config: Config;
  let bibleDao: BibleDao;
  let resourceManager: ResourceManager;
  let bibleService: BibleService;

  function spy() {
    return Sinon.spy();
  }

  function stub() {
    return Sinon.stub();
  }

  beforeEach(() => {
    config = new ConfigTest();
    resourceManager = <any>Sinon.createStubInstance(ResourceManager);
    bibleDao = <any>Sinon.createStubInstance(BibleDao);
    bibleService = new BibleService(config, bibleDao, resourceManager);
  });

  describe('#getBibles()', function () {
    it('should return the bibles from resource manager', async function () {
      // given
      let expectedResult = [new Bible()];
      (<Sinon.SinonStub>resourceManager.getResources).withArgs('', 'bibles', <any>Sinon.match.any).returns(Promise.resolve(expectedResult));

      // when
      const bibles: Bible[] = await bibleService.getBibles();

      // then
      assert.equal(bibles, expectedResult);
    });

    it('should return the bibles from resource manager', async function () {
      // given
      let expectedResult = [new Bible()];
      (<Sinon.SinonStub>resourceManager.getResources).withArgs('', 'bibles', <any>Sinon.match.any).returns(Promise.resolve(expectedResult));

      // when
      const bibles: Bible[] = await bibleService.getBibles();

      // then
      assert.equal(bibles, expectedResult);
    });

    it('should get bibles for the chapter from the database if necessary', async function () {
      // given
      const bibles: Bible[] = [new Bible()];
      (<any>resourceManager.getResources).returns(Promise.resolve(bibles));

      // when
      await bibleService.getBibles();

      // then
      assert.equal((<any>bibleDao.find).callCount, 0);

      // given
      const calledArg = (<any>resourceManager.getResources).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<any>bibleDao.find).calledOnce);
    });
  });

});