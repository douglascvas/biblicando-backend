'use strict';
import {AuthenticationService} from "../common/service/restAuthenticationService";
import {MarkService} from "./markService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestMapping, RequestType, ResponseBody} from "../bdi/decorator/mvc";
import {Named} from "../bdi/decorator/di";
import {Mark} from "./mark";

@Named
export class MarkController {

  constructor(private markService: MarkService,
              private authenticationService: AuthenticationService,
              private restResponseService: RestResponseService) {
  }

  @ResponseBody
  @RequestMapping('/marks', RequestType.GET)
  public getMarks(request, response): Promise<Mark[]> {
    const userId = request.user.id;
    const verseIds = (request.query.verses || '').split(',');

    return this.markService.getMarksForVerses(userId, verseIds);
  }

  @ResponseBody
  @RequestMapping('/marks', RequestType.PUT)
  public saveMarks(request, response): Promise<void> {
    const userId = request.user.id;
    const marks = request.body;

    return this.markService.saveMarks(userId, marks);
  }
}