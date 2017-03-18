'use strict';

import {Verse} from "./Verse";
import {Service, LoggerFactory, Logger} from "node-boot";
import {VerseResourceFetcher} from "./VerseResourceFetcher";

@Service
export class VerseService {
  private _logger: Logger;

  constructor(private _verseResourceFetcher: VerseResourceFetcher, private _loggerFactory: LoggerFactory) {
    this._logger = _loggerFactory.getLogger(VerseService);
  }

  public async findVersesForChapter(chapterId: string): Promise<Verse[]> {
    if (!chapterId) {
      return [];
    }
    let verses: Verse[] = await this._verseResourceFetcher.fetchVerses(chapterId);
    this.sortVersesByNumber(verses);
    return verses;
  }

  public async findVerse(verseId: string): Promise<Verse> {
    if (!verseId) {
      return null;
    }
    return await this._verseResourceFetcher.fetchVerse(verseId);
  }

  private sortVersesByNumber(verses: Verse[]) {
    return verses.sort((a: Verse, b: Verse) => (a.numbers[a.numbers.length - 1] || 0) - (b.numbers[b.numbers.length - 1] || 0));
  }

}
