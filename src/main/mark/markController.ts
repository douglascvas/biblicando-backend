'use strict';
import {AuthenticationService} from "../common/service/restAuthenticationService";
import {MarkService} from "./markService";
import {RestResponseService} from "../common/service/restResponseService";
import {RequestMapping, RequestType} from "../bdi/decorator/mvc";
import {Named} from "../bdi/decorator/di";

@Named
export class MarkController {

  constructor(private markService: MarkService,
              private authenticationService: AuthenticationService,
              private restResponseService: RestResponseService) {
  }

  @RequestMapping('/marks', RequestType.GET)
  public getMarks(request, response) {
    const userId = request.user.id;
    const verseIds = (request.query.verses || '').split(',');

    let result = this.markService.getMarksForVerses(userId, verseIds);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('/marks', RequestType.PUT)
  public saveMarks(request, response) {
    const userId = request.user.id;
    const marks = request.body;

    let result = this.markService.saveMarks(userId, marks);
    this.restResponseService.respond(request, response, result);
  }
}