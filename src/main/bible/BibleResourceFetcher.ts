'use strict';
import {BibleDao} from "./BibleDao";
import {Bible} from "./Bible";
import {Service} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";
import {Config} from "../config/Config";

@Service
export class BibleResourceFetcher {

  constructor(private bibleDao: BibleDao,
              private config: Config,
              private resourceManager: ResourceManager) {
  }

  public async fetchBibles(): Promise<Bible[]> {
    const filter = this.config.bible.filter || {};
    return await this.resourceManager.getResources('', 'bibles', id => this.bibleDao.find(filter, {}));
  }

  public async fetchBible(bibleId: string): Promise<Bible> {
    return this.resourceManager.getResource(bibleId, 'bible', id => this.bibleDao.findOne(id));
  }
}