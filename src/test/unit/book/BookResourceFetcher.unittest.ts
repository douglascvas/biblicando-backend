'use strict';

import * as Sinon from "sinon";
import {assert} from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {Book} from "../../../main/book/Book";
import {BookDao} from "../../../main/book/BookDao";
import {Config} from "../../../main/config/Config";
import {ConfigTest} from "../../ConfigTest";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";
import {BookResourceFetcher} from "../../../main/book/BookResourceFetcher";
import SinonStub = Sinon.SinonStub;
import SinonMatch = Sinon.SinonMatch;


describe('BookResourceFetcher', function () {

  let config: Config;
  let bookDao: BookDao;
  let resourceManager: ResourceManager;
  let bookResourceFetcher: BookResourceFetcher;
  let loggerFactory: LoggerFactory;

  beforeEach(() => {
    config = new ConfigTest();
    resourceManager = Sinon.createStubInstance(ResourceManager);
    bookDao = Sinon.createStubInstance(BookDao);
    loggerFactory = new TestLoggerFactory();
    bookResourceFetcher = new BookResourceFetcher(bookDao, resourceManager);
  });

  describe('#fetchBooks()', function () {
    it('should fetch the books from the server', async function () {
      // given
      const bibles: Book[] = [new Book()];
      const bibleId: string = '123';
      (<SinonStub>resourceManager.getResources).returns(Promise.resolve(bibles));

      // when
      await bookResourceFetcher.fetchBooks(bibleId);

      // then
      assert.isTrue((<SinonStub>resourceManager.getResources).calledWith(bibleId, 'books', Sinon.match.any));

      // given
      const calledArg = (<any>resourceManager.getResources).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<SinonStub>bookDao.findByBible).withArgs(bibleId).calledOnce);
    });
  });

  describe('#fetchBook()', function () {
    it('should fetch the book from the server', async function () {
      // given
      const bibles: Book[] = [new Book()];
      const bookId: string = '123';
      (<SinonStub>resourceManager.getResource).returns(Promise.resolve(bibles));

      // when
      await bookResourceFetcher.fetchBook(bookId);

      // then
      assert.isTrue((<SinonStub>resourceManager.getResource).calledWith(bookId, 'book', Sinon.match.any));

      // given
      const calledArg = (<any>resourceManager.getResource).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<SinonStub>bookDao.findOne).withArgs(bookId).calledOnce);
    });
  });

});