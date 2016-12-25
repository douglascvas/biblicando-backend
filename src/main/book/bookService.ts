'use strict';
import {BookDao} from "./bookDao";
import {Book} from "./book";
import {Optional, Service, Logger, LoggerFactory} from "node-boot";
import {ResourceManager} from "../common/resourceManager";
import {ChapterService} from "../chapter/chapterService";
import {Chapter} from "../chapter/chapter";

@Service
export class BookService {

  private logger: Logger;

  constructor(private chapterService: ChapterService,
              private bookDao: BookDao,
              private loggerFactory: LoggerFactory,
              private resourceManager: ResourceManager) {
    this.logger = loggerFactory.getLogger(BookService);
  }

  public async getBooks(bibleId: string): Promise<Book[]> {
    if (!bibleId) {
      return [];
    }
    return this.resourceManager.getResources(bibleId, 'books', id => this.bookDao.findByBible(id));
  }

  public async getBook(bookId: string): Promise<Optional<Book>> {
    if (!bookId) {
      return Optional.empty();
    }
    return this.resourceManager.getResource(bookId, 'book', id => this.bookDao.findOne(id));
  }

  /**
   * Load all the books from the bible, filling the first of them with it's chapters.
   */
  public async loadFromBible(bibleId: string): Promise<Book[]> {
    let books: Book[] = await this.getBooks(bibleId);
    books = books.sort((a: Book, b: Book) => a.number - b.number);
    let chapters: Chapter[] = await this.chapterService.loadFromBook(books[0]._id);
    if (books.length) {
      books[0].chapters = chapters;
    }
    return books;
  }

}