'use strict';

import {VerseDao} from "./verseDao";
import {ChapterDao} from "../chapter/ChapterDao";
import {RemoteApiInfoService} from "../common/service/RemoteApiInfoService";
import {Verse} from "./verse";
import {Chapter} from "../chapter/Chapter";
import {ResourceManager} from "../common/ResourceManager";
import {RemoteService} from "../common/interface/remoteService";
import {Service} from "node-boot";

@Service
export class VerseService {

  constructor(private verseDao: VerseDao,
              private chapterDao: ChapterDao,
              private remoteApiInfoService: RemoteApiInfoService,
              private resourceManager: ResourceManager) {
  }

  public async getVerses(chapterId: string): Promise<Verse[]> {
    if (!chapterId) {
      return [];
    }
    return this.resourceManager.getResources(chapterId,
      'verses',
      id => this.verseDao.findByChapter(id),
      id => this.loadVersesFromRemote(chapterId),
      verses => Promise.resolve(verses)
    );
  }

  public async getVerse(verseId: string): Promise<Verse> {
    return <Verse>await this.resourceManager.getResource(verseId, 'verse', id => this.verseDao.findOne(id));
  }


  private getChapter(chapterId: string): Promise<Chapter> {
    return this.resourceManager.getResource(chapterId, 'chapter', id => this.chapterDao.findOne(id));
  }

  private async loadVersesFromRemote(chapterId: string): Promise<Verse[]> {
    const chapter: Chapter = await this.getChapter(chapterId);
    if (!chapter) {
      return [];
    }
    let remoteService: RemoteService = this.remoteApiInfoService.getService(chapter.remoteSource);
    return remoteService ? remoteService.getVerses(chapter.remoteId) : [];
  }

}
