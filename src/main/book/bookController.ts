'use strict';
namespace book {
  import Request = common.Request;
  import RequestType = common.RequestType;
  import Inject = common.Inject;
  import Controller = common.Controller;

  @Inject
  @Controller
  export class BookController {
    constructor(private bookService, private restResponseService) {
    }

    @Request('bible/{bibleId}/books', RequestType.GET)
    public getBooks(request, response) {
      const bibleId = request.params.bibleId;
      let result = this.bookService.getBooks(bibleId);
      this.restResponseService.respond(request, response, result);
    }

    @Request('book/{bookId}', RequestType.GET)
    public getBook(request, response) {
      const bookId = request.params.bookId;
      let result = this.bookService.getBook(bookId);
      this.restResponseService.respond(request, response, result);
    }
  }


}