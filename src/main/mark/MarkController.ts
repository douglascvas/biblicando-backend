'use strict';
import {AuthenticationService} from "../common/service/RestAuthenticationService";
import {MarkService} from "./MarkService";
import {RestResponseService} from "../common/service/RestResponseService";
import {Mark} from "./Mark";
import {Service, ResponseBody, RequestMapping, RequestType} from "node-boot";

@Service
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