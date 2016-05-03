'use strict';
import {Controller} from "../common/decorators/controller";
import {Inject} from "../common/decorators/inject";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";
import {Request, Response} from "express-serve-static-core";

@Inject()
@Controller()
export class ChapterController {

  constructor(private chapterService,
              private restResponseService) {
  }

  @RequestMapping('book/{bookId}/chapters', RequestType.GET)
  public getChapters(request:Request, response:Response) {
    const bookId = request.params.bookId;
    let result = this.chapterService.getChapters(bookId);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('chapter/{chapterId}', RequestType.GET)
  public getChapter(request:Request, response:Response) {
    const chapterId = request.params.chapterId;
    let result = this.chapterService.getChapter(chapterId);
    this.restResponseService.respond(request, response, result);
  }
}