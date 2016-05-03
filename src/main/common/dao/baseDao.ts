'use strict';

import {Db, ObjectID} from "mongodb";
import {InsertOneWriteOpResult} from "mongodb";
import {UpdateWriteOpResult} from "mongodb";
import IPromise = Q.IPromise;

export class BaseDao<T> {
  constructor(private db:Db, private collectionName:string) {
  }

  public findOne(query):IPromise<T> {
    if (typeof query === 'string') {
      query = {
        _id: ObjectID.createFromHexString(query)
      };
    }
    let collection = this.db.collection(this.collectionName);
    return collection.find(query).limit(1).toArray().then(result=>result[0]);
  }

  public find(query, options):IPromise<T[]> {
    options = options || {};
    query = query || {};
    let collection = this.db.collection(this.collectionName);
    var result = collection.find(query);
    if (options.limit) {
      result = result.limit(options.limit)
    }
    if (options.skip) {
      result = result.skip(options.skip)
    }
    return result.toArray();
  }

  public insertOne(resource:T):IPromise<InsertOneWriteOpResult> {
    let collection = this.db.collection(this.collectionName);
    return collection.insertOne(resource);
  }

  public insert(resources:T[]) {
    let collection = this.db.collection(this.collectionName);
    return collection.insertMany(resources);
  }

  public updateOne(query:any, resource:any, options:any):IPromise<UpdateWriteOpResult> {
    options = options || {};
    if (typeof query === 'string') {
      query = {
        _id: ObjectID.createFromHexString(query)
      };
    }
    let collection = <any>this.db.collection(this.collectionName);
    return collection.updateOne(query, resource, options);
  }

  public remove(query:any):IPromise<any> {
    let collection = <any>this.db.collection(this.collectionName);
    return collection.removeMany(query);
  }

  public removeOne(resourceId:string):IPromise<any> {
    var query = {
      _id: ObjectID.createFromHexString(resourceId)
    };
    let collection = <any>this.db.collection(this.collectionName);
    return collection.removeOne(query);
  }
}

