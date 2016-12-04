'use strict';
import {BookService} from "./bookService";
import {RestResponseService} from "../common/service/restResponseService";
import {Named} from "../bdi/decorator/di";
import {Book} from "./book";
import {LoggerFactory} from "../common/loggerFactory";
import {RequestMapping, RequestType, ResponseBody, Router} from "../bdi/decorator/mvc";
import {Optional} from "../common/optional";
import {IRouter} from "express-serve-static-core";

@Named
export class BookController {
  private log;

  constructor(@Router private router: IRouter,
              private loggerFactory: LoggerFactory,
              private bookService: BookService,
              private restResponseService: RestResponseService) {
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