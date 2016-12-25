'use strict';
import {BookService} from "./bookService";
import {Book} from "./book";
import {Optional, Service, ResponseBody, RequestMapping, RequestType, LoggerFactory} from "node-boot";

@Service
export class BookController {
  private log;

  constructor(private loggerFactory: LoggerFactory,
              private bookService: BookService) {
    this.log = loggerFactory.getLogger(BookController);
  }

  @ResponseBody
  @RequestMapping('/bible/:bibleId/books', RequestType.GET)
  public async getBooks(request, response): Promise<Book[]> {
    const bibleId = request.params.bibleId;
    this.log.debug(`Loading books for ${bibleId}`);
    return await this.bookService.loadFromBible(bibleId);
  }

  @ResponseBody
  @RequestMapping('/book/:bookId', RequestType.GET)
  public async getBook(request, response): Promise<Book> {
    const bookId = request.params.bookId;
    let result: Optional<Book> = await this.bookService.getBook(bookId);
    return result.orElse(null);
  }
}