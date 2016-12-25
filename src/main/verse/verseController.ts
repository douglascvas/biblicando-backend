'use strict';
import {VerseService} from "./verseService";
import {RestResponseService} from "../common/service/restResponseService";
import {Verse} from "./verse";
import {Service, ResponseBody, RequestMapping, RequestType} from "node-boot";

@Service
export class VerseController {
  constructor(private verseService: VerseService,
              private restResponseService: RestResponseService) {
  }

  @ResponseBody
  @RequestMapping('/chapter/:chapterId/verses', RequestType.GET)
  public async getVerses(request, response): Promise<Verse[]> {
    const chapterId = request.params.chapterId;
    return this.verseService.getVerses(chapterId);
  }

  @ResponseBody
  @RequestMapping('/verse/:verseId', RequestType.GET)
  public async getVerse(request, response): Promise<Verse> {
    const verseId = request.params.verseId;
    const verse = await this.verseService.getVerse(verseId);
    return verse.orElse(null);
  }
}