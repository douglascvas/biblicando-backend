'use strict';

namespace verse {

  import BaseDao = common.BaseDao;
  import Collection = common.Collection;

  export class VerseDao extends BaseDao {
    constructor(private database) {
      super(database, Collection.VERSE);
    }

    public findByNumber(chapterId, number) {
      var query = {
        "chapter.id": chapterId,
        "number": number
      };
      return this.find(query, {});
    }

    public findByChapter(chapterId, options) {
      var query = {
        "chapter.id": chapterId
      };
      return this.find(query, options);
    }
  }


}