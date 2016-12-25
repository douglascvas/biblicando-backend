'use strict';

import {BibleService} from "./bibleService";
import {RestResponseService} from "../common/service/restResponseService";
import {Bible} from "./bible";
import {Optional, LoggerFactory, ResponseBody, RequestMapping, RequestType, Service} from "node-boot";

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
    let bibles: Bible[] = await this.bibleService.getBibles();
    this.log.debug(bibles.length, 'bibles queried--', bibles.map(bible => bible._id + ' - ' + bible.name));
    return bibles;
  }

  @ResponseBody
  @RequestMapping('/bible/:bibleId', RequestType.GET)
  public async getBible(request, response) {
    const bibleId = request.params.bibleId;
    let bible: Optional<Bible> = await this.bibleService.getBible(bibleId);
    this.log.debug('bible queried', bibleId, '. Found: ', bible.isPresent() ? 1 : 0);
    return bible.orElse(null);
  }

  // @RequestMapping('/bibles/sync', RequestType.POST)
  // public syncBibles(request, response) {
  //   var result = this.bibleService.loadBiblesFromRemote();
  //   this.restResponseService.respond(request, response, result);
  // }
}
