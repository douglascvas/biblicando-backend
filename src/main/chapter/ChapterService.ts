'use strict';
import {ChapterDao} from "./ChapterDao";
import {Chapter} from "./Chapter";
import {VerseService} from "../verse/verseService";
import {Service} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";
import {Config} from "../config/Config";

@Service
export class ChapterService {
  private CACHE_TIMEOUT;

  constructor(private config: Config,
              private chapterDao: ChapterDao,
              private verseService: VerseService,
              private resourceManager: ResourceManager) {
    this.CACHE_TIMEOUT = config.cache.expirationInMillis;
  }

  public async getChapters(bookId: string): Promise<Chapter[]> {
    if (!bookId) {
      return [];
    }
    return this.resourceManager.getResources(bookId, 'chapters', id => this.chapterDao.findByBook(id));
  }

  public async getChapter(chapterId: string): Promise<Chapter> {
    if (!chapterId) {
      return null;
    }
    return this.resourceManager.getResource(chapterId, 'chapter', id => this.chapterDao.findOne(id));
  }

  /**
   * Load all the chapters from the book, filling the first of them with it's verses.
   */
  public async loadFromBook(bookId: string): Promise<Chapter[]> {
    let chapters: Chapter[] = await this.getChapters(bookId);
    chapters = chapters.sort((a: Chapter, b: Chapter) => a.number - b.number);
    if (chapters.length) {
      chapters[0].verses = await this.verseService.getVerses(chapters[0]._id);
    }
    return chapters;
  }
}
