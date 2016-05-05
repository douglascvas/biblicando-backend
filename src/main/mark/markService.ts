'use strict';
import {Inject} from "../common/decorators/inject";
import {MarkDao} from "./markDao";
import {Mark} from "./mark";
import {ValidationService} from "../common/service/validationService";
import * as assert from "assert";

@Inject()
export class MarkService {
  constructor(private markDao:MarkDao,
              private validationService:ValidationService) {

  }

  private extractVerseIds(marks:Mark[]):Set<string> {
    return new Set(marks.map(mark => mark.verse._id));
  }

  private validateMarks(marks:Mark[]) {
    const markSchema = this.validationService.getSchema('mark');
    assert(marks && marks instanceof Array);
    this.validationService.validateAll(marks, markSchema);
  }

  private updateMarksInsertDate(marks:Mark[], date:Date):void {
    marks.forEach(mark => mark.insertDate = date);
  }

  public getMarksForVerses(userId:string, verseIds:string[]) {
    verseIds.forEach(id => assert(typeof id === 'string'));
    return this.markDao.findFromVerses(userId, verseIds);
  }

  public saveMarks(userId: string, marks: Mark[]) {
    assert(userId);
    this.validateMarks(marks);

    let verseIds:Set<string> = this.extractVerseIds(marks);
    let insertDate:Date = new Date();
    this.updateMarksInsertDate(marks, insertDate);
    if (marks.length) {
      this.markDao.insert(marks);
    }
    this.markDao.removeFromVerses(userId, Array.from(verseIds.values()), insertDate);
  }
}