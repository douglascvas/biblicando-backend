'use strict';
import {ChapterDao} from "./ChapterDao";
import {Chapter} from "./Chapter";
import {Service} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";

@Service
export class ChapterResourceFetcher {

  constructor(private chapterDao: ChapterDao,
              private resourceManager: ResourceManager) {
  }

  public async fetchChapters(bookId: string): Promise<Chapter[]> {
    return await this.resourceManager.getResources(bookId, 'chapters', id => this.chapterDao.findByBook(id));
  }

  public async fetchChapter(chapterId: string): Promise<Chapter> {
    return this.resourceManager.getResource(chapterId, 'chapter', id => this.chapterDao.findOne(id));
  }
}