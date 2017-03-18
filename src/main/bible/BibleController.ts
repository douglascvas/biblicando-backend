'use strict';

import {RestResponseService} from "../common/service/RestResponseService";
import {Bible} from "./Bible";
import {LoggerFactory, ResponseBody, RequestMapping, RequestType, Service} from "node-boot";
import {BibleService} from "./BibleService";

@Service
export class BibleController {
  private log;

  constructor(private loggerFactory: LoggerFactory,
              private bibleService: BibleService,
              private restResponseService: RestResponseService) {
    this.log = loggerFactory.getLogger(BibleController);
  }

  @ResponseBody
  @RequestMapping('/bibles', RequestType.GET)
  public async getBibles(request, response): Promise<Bible[]> {
    let bibles: Bible[] = await this.bibleService.findBibles();
    this.log.debug(bibles.length, 'bibles queried--', bibles.map(bible => bible._id + ' - ' + bible.name));
    return bibles;
  }

  @ResponseBody
  @RequestMapping('/bible/:bibleId', RequestType.GET)
  public async getBible(request, response) {
    const bibleId = request.params.bibleId;
    let bible: Bible = await this.bibleService.findBible(bibleId);
    this.log.debug('bible queried', bibleId, '. Found: ', bible ? 1 : 0);
    return bible;
  }

  // @RequestMapping('/bibles/sync', RequestType.POST)
  // public syncBibles(request, response) {
  //   var result = this.bibleService.loadBiblesFromRemote();
  //   this.restResponseService.respond(request, response, result);
  // }
}
