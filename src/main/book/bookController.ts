'use strict';
import {BookService} from "./bookService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestType, RequestMapping} from "../common/decorators/requestMapping";
import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {ChapterService} from "../chapter/chapterService";
import {VerseService} from "../verse/verseService";
import {Book} from "./book";
import {LoggerFactory} from "../common/loggerFactory";

@Inject
@Controller
export class BookController {
  private log;

  constructor(loggerFactory:LoggerFactory,
              private bookService:BookService,
              private restResponseService:RestResponseService) {
    this.log = loggerFactory.getLogger(BookController);
  }

  @RequestMapping('/bible/:bibleId/books', RequestType.GET)
  public getBooks(request, response) {
    const bibleId = request.params.bibleId;
    this.log.debug(`Loading books for ${bibleId}`);
    let result = this.bookService.loadFromBible(bibleId);

    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/book/:bookId', RequestType.GET)
  public getBook(request, response) {
    const bookId = request.params.bookId;
    let result = this.bookService.getBook(bookId);
    this.restResponseService.respond(request, response, result);
  }
}