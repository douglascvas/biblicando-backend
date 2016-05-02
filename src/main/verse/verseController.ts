'use strict';
namespace verse {

  import Request = common.Request;
  import RequestType = common.RequestType;
  import Inject = common.Inject;
  import Controller = common.Controller;
  import RestResponseService = common.RestResponseService;

  @Inject
  @Controller
  export class VerseController {

    constructor(private verseService:VerseService, private restResponseService:RestResponseService) {
    }

    @Request('chapter/{chapterId}/verses', RequestType.GET)
    public getVerses(request, response) {
      const chapterId = request.params.chapterId;
      let result = this.verseService.getVerse(chapterId);
      this.restResponseService.respond(request, response, result);
    }

    @Request('verse/{verseId}', RequestType.GET)
    public getVerse(request, response) {
      const verseId = request.params.verseId;
      let result = this.verseService.getVerse(verseId);
      this.restResponseService.respond(request, response, result);
    }
  }

}