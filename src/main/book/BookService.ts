'use strict';
import {Book} from "./Book";
import {Service, Logger, LoggerFactory} from "node-boot";
import {ChapterService} from "../chapter/ChapterService";
import {Chapter} from "../chapter/Chapter";
import {BookResourceFetcher} from "./BookResourceFetcher";

@Service
export class BookService {

  private logger: Logger;

  constructor(private chapterService: ChapterService,
              private bookResourceFetcher: BookResourceFetcher,
              private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger(BookService);
  }

  public async findBooksForBible(bibleId: string): Promise<Book[]> {
    if (!bibleId) {
      return [];
    }
    let books: Book[] = await this.bookResourceFetcher.fetchBooks(bibleId);
    this.sortBooksByNumber(books);
    await this.loadChapterForFirstBook(books[0]);
    return books;
  }

  public async findBook(bookId: string): Promise<Book> {
    let book: Book = await this.bookResourceFetcher.fetchBook(bookId);
    await this.loadChapterForFirstBook(book);
    return book || null;
  }

  private async loadChapterForFirstBook(book: Book) {
    if (book) {
      let chapters: Chapter[] = await this.chapterService.findChaptersForBook(book._id);
      book.chapters = chapters;
    }
  }

  private sortBooksByNumber(books: Book[]) {
    return books.sort((a: Book, b: Book) => a.number - b.number);
  }


}