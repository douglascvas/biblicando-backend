'use strict';

import {BookService} from "../../../main/book/BookService";
import * as Sinon from "sinon";
import {assert} from "chai";
import {ResourceManager} from "../../../main/common/ResourceManager";
import {RemoteApiInfoService} from "../../../main/common/service/RemoteApiInfoService";
import {Book} from "../../../main/book/Book";
import {BookDao} from "../../../main/book/BookDao";
import {Config} from "../../../main/config/Config";
import {ConfigTest} from "../../ConfigTest";
import {ChapterService} from "../../../main/chapter/ChapterService";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";


describe('BookService', function () {

  let config: Config;
  let bookDao: BookDao;
  let resourceManager: ResourceManager;
  let bookService: BookService;
  let remoteApiInfoService: RemoteApiInfoService;
  let chapterService: ChapterService;
  let loggerFactory: LoggerFactory;

  function spy() {
    return Sinon.spy();
  }

  function stub() {
    return Sinon.stub();
  }

  beforeEach(() => {
    config = new ConfigTest();
    resourceManager = Sinon.createStubInstance(ResourceManager);
    bookDao = Sinon.createStubInstance(BookDao);
    chapterService = Sinon.createStubInstance(ChapterService);
    loggerFactory = new TestLoggerFactory();
    bookService = new BookService(chapterService, bookDao, loggerFactory, resourceManager);
  });

  describe('#getBooks()', function () {
    it('should return the book from resource manager', async function () {
      // given
      let expectedResult = [new Book()];
      (<Sinon.SinonStub>resourceManager.getResource).withArgs('xxx', 'book', <any>Sinon.match.any).returns(Promise.resolve(expectedResult));

      // when
      const book: Book = await bookService.getBook('xxx');

      // then
      assert.equal(book, expectedResult);
    });

    it('should get books for the chapter from the database if necessary', async function () {
      // given
      const books: Book[] = [new Book()];
      (<any>resourceManager.getResources).returns(Promise.resolve(books));

      // when
      await bookService.getBooks('xxx');

      // then
      assert.equal((<any>bookDao.findByBible).callCount, 0);

      // given
      const calledArg = (<any>resourceManager.getResources).args[0][2];

      // when
      calledArg('123');

      assert.isTrue((<any>bookDao.findByBible).calledOnce);
    });
  });

});