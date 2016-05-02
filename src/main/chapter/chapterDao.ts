namespace chapter {
  'use strict';

  import BaseDao = common.BaseDao;
  import Inject = common.Inject;
  import Collection = common.Collection;

  @Inject
  export class ChapterDao extends BaseDao {

    constructor(private database) {
      super(database, Collection.CHAPTER);
    }

    public findByBook(bibleId) {
      var query = {
        "book.id": bibleId
      };
      return this.find(query, {});
    }
  }

}