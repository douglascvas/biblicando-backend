'use strict';
import {Inject} from "../common/decorators/inject";
import {VerseDao} from "./verseDao";
import {ChapterDao} from "../chapter/chapterDao";
import {RemoteApiInfoService} from "../common/service/remoteApiInfoService";
import {Verse} from "./verse";
import {Chapter} from "../chapter/chapter";
import {Optional} from "../common/optional";
import {ResourceManager} from "../common/resourceManager";
import {RemoteService} from "../common/interface/remoteService";

@Inject
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

  public async getVerse(verseId: string): Promise<Optional<Verse>> {
    if (!verseId) {
      return Optional.empty();
    }
    return this.resourceManager.getResource(verseId, 'verse', id => this.verseDao.findOne(id));
  }


  private getChapter(chapterId: string): Promise<Optional<Chapter>> {
    return this.resourceManager.getResource(chapterId, 'chapter', id => this.chapterDao.findOne(id));
  }

  private async loadVersesFromRemote(chapterId: string): Promise<Verse[]> {
    const chapter: Optional<Chapter> = await this.getChapter(chapterId);
    if (!chapter.isPresent()) {
      return [];
    }
    let remoteService: RemoteService = this.remoteApiInfoService.getService(chapter.get().remoteSource);
    return remoteService.getVerses(chapter.get().remoteId);
  }

}
