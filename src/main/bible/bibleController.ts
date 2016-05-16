'use strict';

import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {BibleService} from "./bibleService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";

@Inject
@Controller
export class BibleController {
  constructor(private bibleService:BibleService,
              private restResponseService:RestResponseService) {
  }

  @RequestMapping('/bibles', RequestType.GET)
  public getBibles(request, response) {
    var result = this.bibleService.getBibles();
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/bible/{bibleId}', RequestType.GET)
  public getBible(request, response) {
    const bibleId = request.params.bibleId;
    let result = this.bibleService.getBible(bibleId);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/bibles/sync', RequestType.POST)
  public syncBibles(request, response) {
    this.bibleService.synchronizeRemoteBibles();
    this.restResponseService.respond(request, response);
  }
}
