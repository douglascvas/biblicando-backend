import {BibleDao} from "./bibleDao";
import {Inject} from "../common/decorators/inject";
import {CacheService} from "../common/service/cacheService";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Bible} from "./bible";
import {RemoteApiInfo} from "../common/enums/remoteApiInfo";
import {UpdateWriteOpResult} from "mongodb";
import {Promise} from "../common/interface/promise";
import {DependencyInjector} from "../common/service/dependencyInjector";

@Inject
export class BibleService {
  private CACHE_TIMEOUT = this.config.get('cache.expirationInMillis');

  constructor(private config,
              private httpClient,
              private dependencyInjector:DependencyInjector,
              private cacheService:CacheService,
              private bibleDao:BibleDao,
              private remoteApiInfoService:RemoteApiInfoService) {

  }

  public getBibles():Promise<Bible[]> {
    return this.cacheService.get(`bibles`)
      .then(bibles=> bibles ? bibles : this.getBiblesFromDatabaseAndUpdateCache());
  }

  public getBible(bibleId:string):Promise<Bible> {
    return this.cacheService.get(`bible_${bibleId}`)
      .then(bible=> bible ? bible : this.getBibleFromDatabaseAndUpdateCache(bibleId));
  }

  private getBibleFromDatabaseAndUpdateCache(bibleId:string):Promise<Bible> {
    return this.bibleDao.findOne(bibleId)
      .then(bible=> {
        if (bible) {
          this.cacheService.set(`bible_${bibleId}`, bible, this.CACHE_TIMEOUT);
        }
        return bible;
      });
  }

  private storeBiblesInCache(bibles:Bible[]):Bible[] {
    if (!bibles || !bibles.length) {
      return [];
    }
    this.cacheService.set(`bibles`, bibles, this.CACHE_TIMEOUT);
    return bibles;
  }

  private getBiblesFromDatabaseAndUpdateCache():Promise<Bible[]> {
    var filter = this.config.get("bible.filter") || {};
    return this.bibleDao.find(filter, {}).then(bibles => this.storeBiblesInCache(bibles));
  }

  private updateBiblesInDatabase(bibles:Bible[]):Promise<UpdateWriteOpResult[]> {
    var result:Promise<UpdateWriteOpResult>[] = bibles
      .map(bible => this.bibleDao.updateRemoteBible(bible));
    return Promise.all<UpdateWriteOpResult>(result);
  }

  private fetchFromRemoteApiAndStoreInDatabase(info:RemoteApiInfo):Promise<Bible[]> {
    var remoteService = this.dependencyInjector.get(info.serviceClass);
    return remoteService.getBibles()
      .then(bibles=>this.updateBiblesInDatabase(bibles));
  }

  public synchronizeRemoteBibles():Promise<Bible[]> {
    var remoteApiInfo:RemoteApiInfo[] = this.remoteApiInfoService.listAll();
    var biblesPromise = remoteApiInfo.map((info:RemoteApiInfo) => this.fetchFromRemoteApiAndStoreInDatabase(info))
      .reduce((result, bibles) => [].concat(result, bibles), []);
    return Promise.all<Bible>(biblesPromise);
  }
}