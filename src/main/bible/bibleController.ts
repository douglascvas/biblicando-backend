'use strict';

// import Controller = common.Controller;
import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {BibleService} from "./bibleService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";
import {Request, Response} from "express";

@Inject()
@Controller()
export class BibleController {

  constructor(private bibleService:BibleService,
              private restResponseService:RestResponseService) {
  }

  @RequestMapping('/bibles', RequestType.GET)
  public getBibles(request:Request, response:Response) {
    var result = this.bibleService.getBibles();
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/bible/{bibleId}', RequestType.GET)
  public getBible(request:Request, response:Response) {
    const bibleId = request.params.bibleId;
    let result = this.bibleService.getBible(bibleId);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/bibles/sync', RequestType.POST)
  public syncBibles(request:Request, response:Response) {
    this.bibleService.synchronizeRemoteBibles();
    this.restResponseService.respond(request, response);
  }
}
