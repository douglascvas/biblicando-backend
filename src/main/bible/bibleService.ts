import {BibleDao} from "./bibleDao";
import {Inject} from "../common/decorators/inject";
import {Bible} from "./bible";
import {Config} from "../common/config";
import {Optional} from "../common/optional";
import {ResourceManager} from "../common/resourceManager";

@Inject
export class BibleService {

  constructor(private config: Config,
              private bibleDao: BibleDao,
              private resourceManager: ResourceManager) {
  }

  public getBibles(): Promise<Bible[]> {
    const filter = this.config.find("bible.filter") || {};
    return this.resourceManager.getResources('', 'bibles', id => this.bibleDao.find(filter, {}));
  }


  public getBible(bibleId: string): Promise<Optional<Bible>> {
    return this.resourceManager.getResource(bibleId, 'bible', id => this.bibleDao.findOne(id));
  }

}