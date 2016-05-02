namespace common {
  'use strict';

  import mongodb = require('mongodb');

  const ObjectID = mongodb.ObjectID;

  export class BaseDao {
    constructor(private database, private collectionName) {
    }

    public findOne(query) {
      if (typeof query === 'string') {
        query = {
          _id: ObjectID.createFromHexString(query)
        };
      }
      let collection = this.database.collection(this.collectionName);
      return collection.find(query).limit(1).toArray().then(result=>result[0]);
    }

    public find(query, options) {
      options = options || {};
      query = query || {};
      let collection = this.database.collection(this.collectionName);
      var result = collection.find(query);
      if (options.limit) {
        result = result.limit(options.limit)
      }
      if (options.skip) {
        result = result.skip(options.skip)
      }
      return result.toArray();
    }

    public insertOne(resource) {
      let collection = this.database.collection(this.collectionName);
      return collection.insertOne(resource);
    }

    public insert(resources) {
      let collection = this.database.collection(this.collectionName);
      return collection.insertMany(resources);
    }

    public updateOne(query, resource, options) {
      options = options || {};
      if (typeof query === 'string') {
        query = {
          _id: ObjectID.createFromHexString(query)
        };
      }
      let collection = this.database.collection(this.collectionName);
      return collection.updateOne(query, resource, options);
    }

    public remove(query) {
      let collection = this.database.collection(this.collectionName);
      return collection.removeMany(query);
    }

    public removeOne(resourceId) {
      var query = {
        _id: ObjectID.createFromHexString(resourceId)
      };
      let collection = this.database.collection(this.collectionName);
      return collection.removeOne(query);
    }
  }


}