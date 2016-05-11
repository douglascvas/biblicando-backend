import {BibleDao} from "./bibleDao";
import {Inject} from "../common/decorators/inject";
import {CacheService} from "../common/service/cacheService";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Bible} from "./bible";
import {RemoteApiInfo} from "../common/enums/remoteApiInfo";
import {UpdateWriteOpResult} from "mongodb";
import * as Q from "q";
import IPromise = Q.IPromise;

@Inject()
export class BibleService {
  private CACHE_TIMEOUT = this.config.get('cache.expirationInMillis');

  constructor(private config,
              private httpClient,
              private cacheService:CacheService,
              private bibleDao:BibleDao,
              private remoteApiInfoService:RemoteApiInfoService) {

  }

  public getBibles():IPromise<Bible[]> {
    return this.cacheService.getFromCache(`bibles`)
      .then(bibles=> bibles ? bibles : this.getBiblesFromDatabaseAndUpdateCache());
  }

  public getBible(bibleId:string):IPromise<Bible> {
    return this.cacheService.getFromCache(`bible_${bibleId}`)
      .then(bible=> bible ? bible : this.getBibleFromDatabaseAndUpdateCache(bibleId));
  }

  private getBibleFromDatabaseAndUpdateCache(bibleId:string):IPromise<Bible> {
    return this.bibleDao.findOne(bibleId)
      .then(bible=> {
        if (bible) {
          this.cacheService.saveToCache(`bible_${bibleId}`, bible, this.CACHE_TIMEOUT);
        }
        return bible;
      });
  }

  private storeBiblesInCache(bibles:Bible[]):Bible[] {
    if (!bibles || !bibles.length) {
      return [];
    }
    this.cacheService.saveToCache(`bibles`, bibles, this.CACHE_TIMEOUT);
    return bibles;
  }

  private getBiblesFromDatabaseAndUpdateCache():IPromise<Bible[]> {
    return this.bibleDao.find({}, {}).then(bibles => this.storeBiblesInCache(bibles));
  }

  private updateBiblesInDatabase(bibles:Bible[]):IPromise<UpdateWriteOpResult[]> {
    var result:IPromise<UpdateWriteOpResult>[] = [];
    bibles.forEach(bible => {
      result.push(this.bibleDao.updateRemoteBible(bible));
    });
    return Q.all(result);
  }

  private fetchFromRemoteApiAndStoreInDatabase(info:RemoteApiInfo):IPromise<Bible[]> {
    var RemoteDataService:any = info.serviceClass;
    var remoteService = new RemoteDataService(this.config, this.httpClient, this.cacheService);
    return remoteService.getBibles()
      .then(bibles=>this.updateBiblesInDatabase(bibles));
  }

  public synchronizeRemoteBibles():IPromise<Bible[]> {
    var remoteApiInfo:RemoteApiInfo[] = this.remoteApiInfoService.listAll();
    var biblesPromise = remoteApiInfo.map((info:RemoteApiInfo) => this.fetchFromRemoteApiAndStoreInDatabase(info))
      .reduce((result, bibles) => [].concat(result, bibles), []);
    return Q.all(biblesPromise);
  }
}