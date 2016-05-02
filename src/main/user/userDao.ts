'use strict';

namespace user {

  import BaseDao = common.BaseDao;
  import Collection = common.Collection;
  import Inject = common.Inject;

  @Inject
  export class UserDao extends BaseDao {
    constructor(private database) {
      super(database, Collection.USER);
    }

    public findOneByEmail(email) {
      var query = {
        email: email
      };
      return this.findOne(query);
    }
  }

}

