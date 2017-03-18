'use strict';

import {BibleService} from "../../../main/bible/BibleService";
import {assert} from "chai";
import {Bible} from "../../../main/bible/Bible";
import * as Sinon from "sinon";
import {BibleResourceFetcher} from "../../../main/bible/BibleResourceFetcher";

describe('BibleService', function () {

  let bibleResourceFetcher: BibleResourceFetcher;
  let bibleService: BibleService;

  beforeEach(() => {
    bibleResourceFetcher = <any>Sinon.createStubInstance(BibleResourceFetcher);
    bibleService = new BibleService(bibleResourceFetcher);
  });

  describe('#findBible()', function () {
    it('should return null if no bible id is given', async function () {
      // when
      const bible: Bible = await bibleService.findBible(null);

      // then
      assert.isNull(bible);
    });

    it('should fetch the bible from remote', async function () {
      // given
      const bible: Bible = aBibleWithNumber("b1");

      const bibleId: string = 'bible1';
      (<Sinon.SinonStub>bibleResourceFetcher.fetchBible).withArgs(bibleId).returns(Promise.resolve(bible));

      // when
      let result: Bible = await bibleService.findBible(bibleId);

      // then
      assert.strictEqual(result, bible);
    });
  });

  describe('#findBibles()', function () {

    it('should fetch the bibles from remote and sort by number', async function () {
      // given
      const bible1: Bible = aBibleWithNumber("b1");
      const bible2: Bible = aBibleWithNumber("b2");
      const bibles: Bible[] = [bible1, bible2];

      (<Sinon.SinonStub>bibleResourceFetcher.fetchBibles).returns(Promise.resolve(bibles));

      // when
      let result: Bible[] = await bibleService.findBibles();

      // then
      assert.strictEqual(result.length, bibles.length);
      assert.strictEqual(result[0], bible1);
      assert.strictEqual(result[1], bible2);
    });
  });

  function aBibleWithNumber(bibleName: string): Bible {
    let bible: Bible = new Bible();
    bible._id = 'id' + bibleName;
    bible.name = bibleName;
    return bible;
  }
});