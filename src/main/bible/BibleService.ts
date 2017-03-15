import {BibleDao} from "./BibleDao";
import {Bible} from "./Bible";
import {Service} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";
import {Config} from "../config/Config";

@Service
export class BibleService {

  constructor(private config: Config,
              private bibleDao: BibleDao,
              private resourceManager: ResourceManager) {
  }

  public getBibles(): Promise<Bible[]> {
    const filter = this.config.bible.filter || {};
    return this.resourceManager.getResources('', 'bibles', id => this.bibleDao.find(filter, {}));
  }


  public getBible(bibleId: string): Promise<Bible> {
    return this.resourceManager.getResource(bibleId, 'bible', id => this.bibleDao.findOne(id));
  }

}