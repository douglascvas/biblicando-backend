import {CacheService} from "./service/cacheService";
import {Config} from "./config";
import {Service, Optional} from "node-boot";

@Service
export class ResourceManager {
  private CACHE_TIMEOUT;

  constructor(private config: Config,
              private cacheService: CacheService) {
    this.CACHE_TIMEOUT = config.find('cache.expirationInMillis')
  }

  public async getResource<T>(resourceId: string,
                              resourceType: string,
                              loadFromDatabaseCallback: (resourceId: string) => Promise<Optional<T>>,
                              loadFromRemoteCallback?: (resourceId: string) => Promise<Optional<T>>,
                              saveToDatabaseCallback?: (resource: T) => Promise<T>): Promise<Optional<T>> {
    let resource: Optional<T> = <Optional<T>>await this.getResourceFromCache(resourceId, resourceType);
    if (!resource.isPresent()) {
      resource = await this.getResourceFromDatabaseAndUpdateCache(resourceId, resourceType, loadFromDatabaseCallback);
      if (!resource.isPresent() && loadFromRemoteCallback) {
        this.loadResourceFromRemoteAndStore(resourceId, resourceType, loadFromRemoteCallback, saveToDatabaseCallback);
      }
    }
    return resource;
  }

  public async getResources<T>(resourceId: string,
                               resourceType: string,
                               loadFromDatabaseCallback: (resourceId: string) => Promise<T[]>,
                               loadFromRemoteCallback?: (resourceId: string) => Promise<T[]>,
                               saveToDatabaseCallback?: (resource: T[]) => Promise<T[]>): Promise<T[]> {
    let resource: T[];
    let cacheResource: Optional<T[]> = <Optional<T[]>>await this.getResourceFromCache(resourceId, resourceType);
    if (!cacheResource.isPresent() || !cacheResource.get().length) {
      resource = await this.getResourcesFromDatabaseAndUpdateCache(resourceId, resourceType, loadFromDatabaseCallback);
      if (!resource.length && loadFromRemoteCallback) {
        this.loadResourcesFromRemoteAndStore(resourceId, resourceType, loadFromRemoteCallback, saveToDatabaseCallback);
      }
    }
    return resource;
  }


  private async loadResourceFromRemoteAndStore<T>(resourceId: string,
                                                  resourceType: string,
                                                  loadFromRemoteCallback: (resourceId: string) => Promise<Optional<T>>,
                                                  saveToDatabaseCallback: (resource: T) => Promise<T>): Promise<Optional<T>> {
    let resource: Optional<T> = await loadFromRemoteCallback(resourceId);
    if (!resource.isPresent()) {
      return resource;
    }
    return this.storeResourceInDatabaseAndCache(resourceId, resourceType, resource.get(), saveToDatabaseCallback)
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
                                                   saveToDatabaseCallback: (resource: T) => Promise<T>): Promise<Optional<T>> {
    const savedResource: T = await saveToDatabaseCallback(resource);
    this.saveToCache(resourceId, resourceType, savedResource);
    return Optional.of(savedResource);
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
    let key: string = resourceType + (resourceId ? `_${resourceId}` : '');
    this.cacheService.set(key, savedResource);
    return savedResource;
  }

  private getResourceFromCache(resourceId: string, resourceType: string) {
    let key: string = resourceType + (resourceId ? `_${resourceId}` : '');
    return this.cacheService.get(key);
  }

  private async getResourceFromDatabaseAndUpdateCache<T>(resourceId: string,
                                                         resourceType: string,
                                                         loadFromDatabaseCallback: (resourceId: string) => Promise<Optional<T>>): Promise<Optional<T>> {
    const self = this;
    const resource: Optional<T> = await loadFromDatabaseCallback(resourceId);
    if (resource.isPresent()) {
      let key: string = resourceType + (resourceId ? `_${resourceId}` : '');
      self.cacheService.set(key, resource.get(), this.CACHE_TIMEOUT);
    }
    return resource;
  }

  private async getResourcesFromDatabaseAndUpdateCache<T>(resourceId: string,
                                                          resourceType: string,
                                                          loadFromDatabaseCallback: (resourceId: string) => Promise<T[]>): Promise<T[]> {
    const resources: T[] = await loadFromDatabaseCallback(resourceId);
    if (!resources.length) {
      let key: string = resourceType + (resourceId ? `_${resourceId}` : '');
      this.cacheService.set(key, resources, this.CACHE_TIMEOUT);
    }
    return resources;
  }

}