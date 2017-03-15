'use strict';
import {BookDao} from "./BookDao";
import {Book} from "./Book";
import {Service, Logger, LoggerFactory} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";
import {ChapterService} from "../chapter/ChapterService";
import {Chapter} from "../chapter/Chapter";

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
    let books: Book[] = await this.resourceManager.getResources(bibleId, 'books', id => this.bookDao.findByBible(id));
    books = books.sort((a: Book, b: Book) => a.number - b.number);
    let chapters: Chapter[] = await this.chapterService.loadFromBook(books[0]._id);
    if (books.length) {
      books[0].chapters = chapters;
    }
    return books;
  }

  public async getBook(bookId: string): Promise<Book> {
    return this.resourceManager.getResource(bookId, 'book', id => this.bookDao.findOne(id));
  }


}