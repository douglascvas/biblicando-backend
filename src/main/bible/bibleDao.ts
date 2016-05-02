namespace bible {
  'use strict';

  import BaseDao = common.BaseDao;
  import Inject = common.Inject;
  import Collection = common.Collection;
  import Promise = Q.Promise;

  @Inject
  export class BibleDao extends BaseDao {

    constructor(private database) {
      super(database, Collection.BIBLE);
    }

    public findOneByName(name:string):Promise<Bible> {
      var query = {
        name: name
      };
      return this.findOne(query);
    }

    public updateRemoteBible(bible:Bible):Promise<Bible> {
      var query = {
        remoteSource: bible.remoteSource,
        remoteId: bible.remoteId
      };

      return this.updateOne(query, bible, {upsert: true});
    }
  }

  module.exports = BibleDao;
}