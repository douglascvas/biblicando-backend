'use strict';
import {VerseService} from "./VerseService";
import {RestResponseService} from "../common/service/RestResponseService";
import {Verse} from "./Verse";
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
    return this.verseService.findVersesForChapter(chapterId);
  }

  @ResponseBody
  @RequestMapping('/verse/:verseId', RequestType.GET)
  public async getVerse(request, response): Promise<Verse> {
    const verseId = request.params.verseId;
    return await this.verseService.findVerse(verseId);
  }
}