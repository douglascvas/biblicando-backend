namespace bible {
  'use strict';

  import Inject = common.Inject;
  import Controller = common.Controller;
  import Request = common.Request;
  import RequestType = common.RequestType;
  import RestResponseService = common.RestResponseService;

  @Inject
  @Controller
  export class BibleController {

    constructor(private bibleService:BibleService,
                private restResponseService:RestResponseService) {
    }

    @Request('/bibles', RequestType.GET)
    public getBibles(request, response) {
      var result = this.bibleService.getBibles();
      this.restResponseService.respond(request, response, result);
    }

    @Request('/bible/{bibleId}', RequestType.GET)
    public getBible(request, response) {
      const bibleId = request.params.bibleId;
      let result = this.bibleService.getBible(bibleId);
      this.restResponseService.respond(request, response, result);
    }

    @Request('/bibles/sync', RequestType.POST)
    public syncBibles(request, response) {
      this.bibleService.synchronizeRemoteBibles();
      this.restResponseService.respond(request, response);
    }
  }

}