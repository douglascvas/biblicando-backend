'use strict';

export class SessionDao extends BaseDao {
  constructor(private database) {
    super(database, Collection.SESSION);
  }

  public removeOne(token) {
    var query = {
      token: token
    };
    this.removeOne(query);
  }

  public findOneByToken(token) {
    var query = {
      token: token
    };
    let collection = this.database.collection(Collection.SESSION);
    return collection.find(query).limit(1).toArray();
  }
}