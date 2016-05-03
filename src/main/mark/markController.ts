'use strict';

import Inject = common.Inject;
import Controller = common.Controller;
import Request = common.RequestMapping;
import RequestType = common.RequestType;

@Inject
@Controller
export class MarkController {

  constructor(private markService:MarkService,
              private authenticationService,
              private restResponseService) {
  }

  @Request('marks', RequestType.GET)
  public getMarks(request, response) {
    const userId = request.user.id;
    const verseIds = (request.query.verses || '').split(',');

    let result = this.markService.getMarksForVerses(userId, verseIds);
    this.restResponseService.respond(request, response, result);
  }

  @Request('marks', RequestType.PUT)
  public saveMarks(request, response) {
    const userId = request.user.id;
    const marks = request.body;

    let result = this.markService.saveMarks(userId, marks);
    this.restResponseService.respond(request, response, result);
  }
}