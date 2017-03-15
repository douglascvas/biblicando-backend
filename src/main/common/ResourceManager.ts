import {CacheService} from "./service/CacheService";
import {Service} from "node-boot";
import {Config} from "../config/Config";

@Service
export class ResourceManager {
  private CACHE_TIMEOUT;

  constructor(private config: Config,
              private cacheService: CacheService) {
    this.CACHE_TIMEOUT = config.cache.expirationInMillis;
  }

  public async getResource<T>(resourceId: string,
                              resourceType: string,
                              loadFromDatabaseCallback: (resourceId: string) => Promise<T>,
                              loadFromRemoteCallback?: (resourceId: string) => Promise<T>,
                              saveToDatabaseCallback?: (resource: T) => Promise<T>): Promise<T> {
    let resource: T = <T>await this.getResourceFromCache(resourceId, resourceType);
    if (resource) {
      return resource;
    }
    resource = await this.getResourceFromDatabaseAndUpdateCache(resourceId, resourceType, loadFromDatabaseCallback);
    if (resource) {
      return resource;
    }
    if (loadFromRemoteCallback) {
      return this.loadResourceFromRemoteAndStore(resourceId, resourceType, loadFromRemoteCallback, saveToDatabaseCallback);
    }
    return null;
  }

  public async getResources<T>(resourceId: string,
                               resourceType: string,
                               loadFromDatabaseCallback: (resourceId: string) => Promise<T[]>,
                               loadFromRemoteCallback?: (resourceId: string) => Promise<T[]>,
                               saveToDatabaseCallback?: (resource: T[]) => Promise<T[]>): Promise<T[]> {
    let resource: T[];
    let cacheResource: T[] = <T[]>await this.getResourcesFromCache(resourceId, resourceType);
    if (cacheResource.length) {
      return cacheResource;
    }
    resource = await this.getResourcesFromDatabaseAndUpdateCache(resourceId, resourceType, loadFromDatabaseCallback);
    if (resource.length) {
      return resource;
    }
    if (loadFromRemoteCallback) {
      return this.loadResourcesFromRemoteAndStore(resourceId, resourceType, loadFromRemoteCallback, saveToDatabaseCallback);
    }
    return [];
  }


  private async loadResourceFromRemoteAndStore<T>(resourceId: string,
                                                  resourceType: string,
                                                  loadFromRemoteCallback: (resourceId: string) => Promise<T>,
                                                  saveToDatabaseCallback: (resource: T) => Promise<T>): Promise<T> {
    let resource: T = await loadFromRemoteCallback(resourceId);
    if (!resource) {
      return resource;
    }
    return this.storeResourceInDatabaseAndCache(resourceId, resourceType, resource, saveToDatabaseCallback)
  }

  private async loadResourcesFromRemoteAndStore<T>(resourceId: string,
                                                   resourceType: string,
                                                   loadFromRemoteCallback: (resourceId: string) => Promise<T[]>,
                                                   saveToDatabaseCallback: (resource: T[]) => Promise<T[]>): Promise<T[]> {
    const resources: T[] = await loadFromRemoteCallback(resourceId);
    if (!resources.length) {
      return resources;
    }
    return this.storeResourcesInDatabaseAndCache(resourceId, resourceType, resources, saveToDatabaseCallback)
  }

  private async storeResourceInDatabaseAndCache<T>(resourceId: string,
                                                   resourceType: string,
                                                   resource: T,
                                                   saveToDatabaseCallback: (resource: T) => Promise<T>): Promise<T> {
    const savedResource: T = await saveToDatabaseCallback(resource);
    this.saveToCache(resourceId, resourceType, savedResource);
    return savedResource;
  }

  private async storeResourcesInDatabaseAndCache<T>(resourceId: string,
                                                    resourceType: string,
                                                    resources: T[],
                                                    saveToDatabaseCallback: (resources: T[]) => Promise<T[]>): Promise<T[]> {
    const savedResources: T[] = await saveToDatabaseCallback(resources);
    this.saveToCache(resourceId, resourceType, savedResources);
    return savedResources;
  }

  public saveToCache<T>(resourceId: string, resourceType: string, savedResource: T): T {
    let key: string = this.getCacheKey(resourceType, resourceId);
    this.cacheService.set(key, savedResource, this.CACHE_TIMEOUT);
    return savedResource;
  }

  private async getResourceFromCache<T>(resourceId: string, resourceType: string): Promise<T> {
    return <T>await this.cacheService.get(this.getCacheKey(resourceType, resourceId));
  }

  private async getResourcesFromCache<T>(resourceId: string, resourceType: string): Promise<T[]> {
    return (<T[]>await this.cacheService.get(this.getCacheKey(resourceType, resourceId))) || [];
  }

  private async getResourceFromDatabaseAndUpdateCache<T>(resourceId: string,
                                                         resourceType: string,
                                                         loadFromDatabaseCallback: (resourceId: string) => Promise<T>): Promise<T> {
    const resource: T = await loadFromDatabaseCallback(resourceId);
    if (resource) {
      let key: string = this.getCacheKey(resourceType, resourceId);
      await this.cacheService.set(key, resource, this.CACHE_TIMEOUT);
    }
    return resource;
  }

  private getCacheKey(resourceType: string, resourceId: string) {
    return resourceType + (resourceId ? `_${resourceId}` : '');
  }

  private async getResourcesFromDatabaseAndUpdateCache<T>(resourceId: string,
                                                          resourceType: string,
                                                          loadFromDatabaseCallback: (resourceId: string) => Promise<T[]>): Promise<T[]> {
    const resources: T[] = await loadFromDatabaseCallback(resourceId);
    if (!resources.length) {
      let key: string = this.getCacheKey(resourceType, resourceId);
      this.cacheService.set(key, resources, this.CACHE_TIMEOUT);
    }
    return resources;
  }

}