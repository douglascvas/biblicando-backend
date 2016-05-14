'use strict';
import {Controller} from "../common/decorators/controller";
import {Inject} from "../common/decorators/inject";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";

@Inject
@Controller
export class ChapterController {

  constructor(private chapterService,
              private restResponseService) {
  }

  @RequestMapping('book/{bookId}/chapters', RequestType.GET)
  public getChapters(request, response) {
    const bookId = request.params.bookId;
    let result = this.chapterService.getChapters(bookId);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('chapter/{chapterId}', RequestType.GET)
  public getChapter(request, response) {
    const chapterId = request.params.chapterId;
    let result = this.chapterService.getChapter(chapterId);
    this.restResponseService.respond(request, response, result);
  }
}