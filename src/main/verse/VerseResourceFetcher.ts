'use strict';
import {VerseDao} from "./VerseDao";
import {Verse} from "./Verse";
import {Service} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";

@Service
export class VerseResourceFetcher {

  constructor(private verseDao: VerseDao,
              private resourceManager: ResourceManager) {
  }

  public async fetchVerses(chapterId: string): Promise<Verse[]> {
    return await this.resourceManager.getResources(chapterId, 'verses', id => this.verseDao.findByChapter(id));
  }

  public async fetchVerse(verseId: string): Promise<Verse> {
    return this.resourceManager.getResource(verseId, 'verse', id => this.verseDao.findOne(id));
  }
}