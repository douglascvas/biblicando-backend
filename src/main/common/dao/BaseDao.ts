'use strict';

import {Db, ObjectID} from "mongodb";
import {RemoteResource} from "../interface/remoteResource";

export class BaseDao<E> {
  constructor(private db: Db, private collectionName: string) {
  }

  public async updateRemoteResource<T extends RemoteResource>(resource: RemoteResource, options?: any): Promise<T> {
    const self = this;
    options = options || {};
    let queries = [];
    if (resource._id) {
      queries.push({_id: ObjectID.createFromHexString(resource._id)});
    }
    if (resource.remoteId) {
      queries.push({
        remoteId: resource.remoteId,
        remoteSource: resource.remoteSource
      });
    }
    let query = (queries.length > 1 ? {$or: queries} : queries[0]);

    resource.updatedAt = new Date();
    let collection = <any>this.db.collection(this.collectionName);
    if (query) {
      return collection.findOneAndUpdate(query, resource, options);
    } else {
      return collection.findOneAndReplace(resource, resource, options);
    }
  }

  public async findOne(query): Promise<E> {
    if (typeof query === 'string') {
      query = {
        _id: ObjectID.createFromHexString(query)
      };
    }
    let collection = this.db.collection(this.collectionName);
    return <any>collection
      .find(query)
      .limit(1)
      .toArray()
      .then(result => result[0]);
  }

  public async find(query, options?): Promise<E[]> {
    options = options || {};
    query = query || {};
    let collection = this.db.collection(this.collectionName);
    let result = collection.find(query);
    if (options.limit) {
      result = result.limit(options.limit)
    }
    if (options.skip) {
      result = result.skip(options.skip)
    }
    return <any>result.toArray();
  }

  public async insertOne(resource: E): Promise<E> {
    let collection = this.db.collection(this.collectionName);
    return <any>collection.findOneAndReplace(resource, resource);
  }

  public async insert(resources: E[]) {
    let collection = this.db.collection(this.collectionName);
    return collection.insertMany(resources);
  }

  public async updateOne(query: any, resource: any, options?: any): Promise<E> {
    options = options || {};
    if (typeof query === 'string') {
      query = {
        _id: ObjectID.createFromHexString(query)
      };
    }
    let collection = <any>this.db.collection(this.collectionName);
    return collection.findOneAndUpdate(query, resource, options);
  }

  public async patchOne(query: any, resource: any, options?: any): Promise<E> {
    options = options || {};
    if (typeof query === 'string') {
      query = {
        _id: ObjectID.createFromHexString(query)
      };
    }
    let collection = <any>this.db.collection(this.collectionName);
    return collection.findOneAndUpdate(query, {$set: resource}, options);
  }

  public async remove(query: any): Promise<any> {
    let collection = <any>this.db.collection(this.collectionName);
    return collection.removeMany(query);
  }

  public async removeOne(resourceId: string): Promise<any> {
    const query = {
      _id: ObjectID.createFromHexString(resourceId)
    };
    let collection = <any>this.db.collection(this.collectionName);
    return collection.removeOne(query);
  }
}

