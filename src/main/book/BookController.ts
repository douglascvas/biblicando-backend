'use strict';
import {BookService} from "./BookService";
import {Book} from "./Book";
import {Service, ResponseBody, RequestMapping, RequestType, LoggerFactory} from "node-boot";

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
    return await this.bookService.findBooksForBible(bibleId);
  }

  @ResponseBody
  @RequestMapping('/book/:bookId', RequestType.GET)
  public async getBook(request, response): Promise<Book> {
    const bookId = request.params.bookId;
    return await this.bookService.findBook(bookId);
  }
}