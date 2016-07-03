'use strict';

import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {BibleService} from "./bibleService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";
import {LoggerFactory} from "../common/loggerFactory";

@Inject
@Controller
export class BibleController {
  private log;

  constructor(loggerFactory:LoggerFactory,
              private bibleService:BibleService,
              private restResponseService:RestResponseService) {
    this.log = loggerFactory.getLogger(BibleController);
  }

  @RequestMapping('/bibles', RequestType.GET)
  public getBibles(request, response) {
    var self = this;
    var result = this.bibleService.getBibles()
      .then(bibles=> {
        self.log.debug(bibles.length, 'bibles queried', bibles.map(bible=>bible._id + ' - ' + bible.name));
        return bibles;
      });
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/bible/:bibleId', RequestType.GET)
  public getBible(request, response) {
    const bibleId = request.params.bibleId;
    let result = this.bibleService.getBible(bibleId);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/bibles/sync', RequestType.POST)
  public syncBibles(request, response) {
    var result = this.bibleService.synchronizeRemoteBibles();
    this.restResponseService.respond(request, response, result);
  }
}
