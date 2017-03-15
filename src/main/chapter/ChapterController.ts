'use strict';
import {RestResponseService} from "../common/service/RestResponseService";
import {ChapterService} from "./ChapterService";
import {Service, ResponseBody, RequestMapping, RequestType} from "node-boot";
import {Chapter} from "./Chapter";

@Service
export class ChapterController {

  constructor(private chapterService: ChapterService,
              private restResponseService: RestResponseService) {
  }

  @ResponseBody
  @RequestMapping('/book/:bookId/chapters', RequestType.GET)
  public getChapters(request, response): Promise<Chapter[]> {
    const bookId = request.params.bookId;
    return this.chapterService.loadFromBook(bookId);
  }

  @ResponseBody
  @RequestMapping('/chapter/:chapterId', RequestType.GET)
  public async getChapter(request, response): Promise<Chapter> {
    const chapterId = request.params.chapterId;
    return await this.chapterService.getChapter(chapterId);
  }
}