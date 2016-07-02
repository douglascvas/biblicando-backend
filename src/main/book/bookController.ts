'use strict';
import {BookService} from "./bookService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestType, RequestMapping} from "../common/decorators/requestMapping";
import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {ChapterService} from "../chapter/chapterService";
import {VerseService} from "../verse/verseService";
import {Book} from "./book";

@Inject
@Controller
export class BookController {
  constructor(private bookService:BookService,
              private chapterService:ChapterService,
              private verseService:VerseService,
              private restResponseService:RestResponseService) {
  }

  @RequestMapping('/bible/:bibleId/books', RequestType.GET)
  public getBooks(request, response) {
    const bibleId = request.params.bibleId;
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