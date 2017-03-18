'use strict';

import {BookService} from "../../../main/book/BookService";
import * as Sinon from "sinon";
import {assert} from "chai";
import {Book} from "../../../main/book/Book";
import {ChapterService} from "../../../main/chapter/ChapterService";
import {TestLoggerFactory} from "../common/TestLoggerFactory";
import {LoggerFactory} from "node-boot";
import {BookResourceFetcher} from "../../../main/book/BookResourceFetcher";
import {Chapter} from "../../../main/chapter/Chapter";


describe('BookService', function () {

  let bookService: BookService;
  let chapterService: ChapterService;
  let loggerFactory: LoggerFactory;
  let bookResourceFetcher: BookResourceFetcher;

  beforeEach(() => {
    bookResourceFetcher = Sinon.createStubInstance(BookResourceFetcher);
    chapterService = Sinon.createStubInstance(ChapterService);
    loggerFactory = new TestLoggerFactory();
    bookService = new BookService(chapterService, bookResourceFetcher, loggerFactory);
  });

  describe('#findBook()', function () {
    it('should return empty if no book id is given', async function () {
      // when
      const book: Book = await bookService.findBook(null);

      // then
      assert.isNull(book);
    });

    it('should fetch the book from remote', async function () {
      // given
      const book: Book = aBookWithNumber(1);

      const bookId: string = 'book1';
      (<Sinon.SinonStub>bookResourceFetcher.fetchBook).withArgs(bookId).returns(Promise.resolve(book));

      // when
      let result: Book = await bookService.findBook(bookId);

      // then
      assert.strictEqual(result, book);
    });

    it('should load chapters for book', async function () {
      // given
      const book: Book = aBookWithNumber(1);
      const chapters: Chapter[] = [new Chapter()];

      const bookId: string = 'book1';
      (<Sinon.SinonStub>bookResourceFetcher.fetchBook).withArgs(bookId).returns(Promise.resolve(book));
      (<Sinon.SinonStub>chapterService.findChaptersForBook).withArgs(book._id).returns(Promise.resolve(chapters));

      // when
      let result: Book = await bookService.findBook(bookId);

      // then
      assert.strictEqual(result.chapters, chapters);
    });
  });

  describe('#findBooksForBible()', function () {
    it('should return empty if no bible id is given', async function () {
      // when
      const books: Book[] = await bookService.findBooksForBible(null);

      // then
      assert.equal(books.length, 0);
    });

    it('should fetch the books from remote and sort by number', async function () {
      // given
      const book1: Book = aBookWithNumber(1);
      const book2: Book = aBookWithNumber(2);
      const books: Book[] = [book2, book1];

      const bibleId: string = '123';
      (<Sinon.SinonStub>bookResourceFetcher.fetchBooks).withArgs(bibleId).returns(Promise.resolve(books));

      // when
      let result: Book[] = await bookService.findBooksForBible(bibleId);

      // then
      assert.strictEqual(result.length, books.length);
      assert.strictEqual(result[0], book1);
      assert.strictEqual(result[1], book2);
    });

    it('should fetch the chapter for the first book', async function () {
      // given
      const book1: Book = aBookWithNumber(1);
      const book2: Book = aBookWithNumber(2);
      const books: Book[] = [book2, book1];
      const chapters: Chapter[] = [new Chapter()];

      const bibleId: string = '123';
      (<Sinon.SinonStub>bookResourceFetcher.fetchBooks).withArgs(bibleId).returns(Promise.resolve(books));
      (<Sinon.SinonStub>chapterService.findChaptersForBook).withArgs(book1._id).returns(Promise.resolve(chapters));

      // when
      let result: Book[] = await bookService.findBooksForBible(bibleId);

      // then
      assert.strictEqual(result[0].chapters.length, 1);
      assert.strictEqual(result[0].chapters, chapters);
      assert.strictEqual(result[1].chapters.length, 0);
    });
  });

  function aBookWithNumber(bookNumber: number): Book {
    let book: Book = new Book();
    book._id = 'id' + bookNumber;
    book.number = bookNumber;
    book.chapters = [];
    return book;
  }

});