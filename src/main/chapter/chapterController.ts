namespace chapter {

  'use strict';
  import Request = common.Request;
  import RequestType = common.RequestType;

  export class ChapterController {

    constructor(private router, private chapterService, private restResponseService) {
    }

    @Request('book/{bookId}/chapters', RequestType.GET)
    public getChapters(request, response) {
      const bookId = request.params.bookId;
      let result = this.chapterService.getChapters(bookId);
      this.restResponseService.respond(request, response, result);
    }

    @Request('chapter/{chapterId}', RequestType.GET)
    public getChapter(request, response) {
      const chapterId = request.params.chapterId;
      let result = this.chapterService.getChapter(chapterId);
      this.restResponseService.respond(request, response, result);
    }
  }

}