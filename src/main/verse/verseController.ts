'use strict';
import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {VerseService} from "./verseService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";
import {Verse} from "./verse";

@Inject
@Controller
export class VerseController {

  constructor(private verseService:VerseService,
              private restResponseService:RestResponseService) {
  }

  @RequestMapping('/chapter/:chapterId/verses', RequestType.GET)
  public getVerses(request, response) {
    const chapterId = request.params.chapterId;
    let result:Promise<Verse[]> = this.verseService.getVerses(chapterId);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/verse/:verseId', RequestType.GET)
  public getVerse(request, response) {
    const verseId = request.params.verseId;
    let result:Promise<Verse> = this.verseService.getVerse(verseId);
    this.restResponseService.respond(request, response, result);
  }
}