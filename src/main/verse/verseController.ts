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
  constructor(private verseService: VerseService,
              private restResponseService: RestResponseService) {
  }

  @RequestMapping('/chapter/:chapterId/verses', RequestType.GET)
  public async getVerses(request, response): Promise<Verse[]> {
    const chapterId = request.params.chapterId;
    return this.verseService.getVerses(chapterId);
  }

  @RequestMapping('/verse/:verseId', RequestType.GET)
  public async getVerse(request, response): Promise<Verse> {
    const verseId = request.params.verseId;
    const verse = await this.verseService.getVerse(verseId);
    return verse.isPresent() ? verse.get() : null;
  }
}