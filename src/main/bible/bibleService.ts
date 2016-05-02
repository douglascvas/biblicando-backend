namespace bible {
  import Q = require('q');
  import Inject = common.Inject;
  import RemoteApiInfo = common.RemoteApiInfo;
  import CacheService = common.CacheService;
  import RemoteApiInfoService = common.RemoteApiInfoService;
  import Promise = Q.Promise;

  @Inject
  export class BibleService {
    private CACHE_TIMEOUT = this.config.get('cache.expirationInMillis');

    constructor(private config,
                private httpClient,
                private cacheService:CacheService,
                private bibleDao:BibleDao,
                private remoteApiInfoService:RemoteApiInfoService) {

    }

    public getBibles():Bible[] {
      return this.cacheService.getFromCache(`bibles`)
        .then(bibles=> bibles ? bibles : this.getBiblesFromDatabaseAndUpdateCache());
    }

    public  getBible(bibleId:string):Bible {
      return this.cacheService.getFromCache(`bible_${bibleId}`)
        .then(bible=> bible ? bible : this.getBibleFromDatabaseAndUpdateCache(bibleId));
    }

    private getBibleFromDatabaseAndUpdateCache(bibleId:string):Bible {
      return this.bibleDao.findOne(bibleId)
        .then(bible=> {
          if (bible) {
            this.cacheService.storeInCache(`bible_${bibleId}`, bible, this.CACHE_TIMEOUT);
          }
          return bible;
        })
    }

    private storeBiblesInCache(bibles:Bible[]):Bible[] {
      if (!bibles || !bibles.length) {
        return [];
      }
      this.cacheService.storeInCache(`bibles`, bibles, this.CACHE_TIMEOUT);
      return bibles;
    }

    private getBiblesFromDatabaseAndUpdateCache():Bible[] {
      return this.bibleDao.find({}, {}).then(this.storeBiblesInCache);
    }

    private updateBiblesInDatabase(bibles:Bible[]):Promise<Bible[]> {
      var result:Promise<Bible>[] = [];
      bibles.forEach(bible => {
        result.push(this.bibleDao.updateRemoteBible(bible));
      });
      return Q.all(result);
    }

    private fetchFromRemoteApiAndStoreInDatabase(info:RemoteApiInfo):Promise<Bible[]> {
      var RemoteDataService = info.serviceClass;
      var remoteService = new RemoteDataService(this.config, this.httpClient, this.cacheService);
      return remoteService.getBibles()
        .then(bibles=>this.updateBiblesInDatabase(bibles));
    }

    public synchronizeRemoteBibles():Promise<Bible[]> {
      var remoteApiInfo:RemoteApiInfo[] = this.remoteApiInfoService.listAll();
      return Q.all(remoteApiInfo.map(info => this.fetchFromRemoteApiAndStoreInDatabase(info)));
    }
  }
}