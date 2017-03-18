'use strict';
import {Chapter} from "./Chapter";
import {VerseService} from "../verse/VerseService";
import {Service} from "node-boot";
import {ChapterResourceFetcher} from "./ChapterResourceFetcher";
import {LoggerFactory, Logger} from "node-boot";

@Service
export class ChapterService {
  private _logger: Logger;

  constructor(private _verseService: VerseService,
              private _chapterResourceFetcher: ChapterResourceFetcher,
              private _loggerFactory: LoggerFactory) {
    this._logger = _loggerFactory.getLogger(ChapterService);
  }

  public async findChaptersForBook(bookId: string): Promise<Chapter[]> {
    if (!bookId) {
      return [];
    }
    let chapters: Chapter[] = await this._chapterResourceFetcher.fetchChapters(bookId);
    chapters = this.sortChaptersByNumber(chapters);
    await this.loadVersesForChapter(chapters[0]);
    return chapters;
  }

  public async findChapter(chapterId: string): Promise<Chapter> {
    if (!chapterId) {
      return null;
    }
    let chapter: Chapter = await this._chapterResourceFetcher.fetchChapter(chapterId);
    await this.loadVersesForChapter(chapter);
    return chapter;
  }

  private async loadVersesForChapter(chapter: Chapter) {
    if (chapter) {
      chapter.verses = await this._verseService.findVersesForChapter(chapter._id);
    }
  }

  private sortChaptersByNumber(chapters: Chapter[]) {
    return chapters.sort((a: Chapter, b: Chapter) => a.number - b.number);
  }
}
