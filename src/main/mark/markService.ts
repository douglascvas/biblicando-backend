'use strict';
import Inject = common.Inject;
import ValidationService = common.ValidationService;
import Mark = mark.Mark;

@Inject
export class MarkService {
  constructor(private markDao:MarkDao,
              private validationService:ValidationService) {

  }

  private extractVerseIds(marks:Mark[]):Set<string> {
    return new Set(marks.map(mark => mark.verse._id));
  }

  private validateMarks(marks) {
    assert(marks && marks instanceof Array);
    this.validationService.validateAll(marks, Mark);
  }

  private updateMarksInsertDate(marks, date) {
    marks.forEach(mark => mark.insertDate = date);
  }

  public getMarksForVerses(userId, verseIds) {
    verseIds.forEach(id => assert(typeof id === 'string'));
    return this.markDao.findFromVerses(userId, verseIds);
  }

  public saveMarks(userId, marks) {
    assert(userId);
    this.validateMarks(marks);

    let verseIds:Set<string> = this.extractVerseIds(marks);
    let insertDate:Date = new Date();
    this.updateMarksInsertDate(marks, insertDate);
    if (marks.length) {
      this.markDao.insert(marks);
    }
    this.markDao.removeFromVerses(userId, Array.from(verseIds.values), insertDate);
  }
}