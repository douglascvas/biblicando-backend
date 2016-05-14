'use strict';
import {Inject} from "../common/decorators/inject";
import {Controller} from "../common/decorators/controller";
import {AuthenticationService} from "../common/service/restAuthenticationService";
import {MarkService} from "./markService";
import {RequestMapping, RequestType} from "../common/decorators/requestMapping";
import {RestResponseService} from "../common/service/restResponseService";

@Inject
@Controller
export class MarkController {

  constructor(private markService:MarkService,
              private authenticationService:AuthenticationService,
              private restResponseService:RestResponseService) {
  }

  @RequestMapping('marks', RequestType.GET)
  public getMarks(request, response) {
    const userId = request.user.id;
    const verseIds = (request.query.verses || '').split(',');

    let result = this.markService.getMarksForVerses(userId, verseIds);
    this.restResponseService.respond(request, response, result);
  }

  @RequestMapping('marks', RequestType.PUT)
  public saveMarks(request, response) {
    const userId = request.user.id;
    const marks = request.body;

    let result = this.markService.saveMarks(userId, marks);
    this.restResponseService.respond(request, response, result);
  }
}