'use strict';

import {MarkService} from "../../../../main/mark/markService";
import {AssertThat} from "../../assertThat";
import * as sinon from 'sinon';
import * as chai from 'chai';

const assert = chai.assert;
const stub = sinon.stub;

const assertThat = new AssertThat();

describe('MarkService', function () {
  const USER_ID = 'userId';
  var validationService, markService, aMark, anotherMark, markList, markDao, verseIds;

  beforeEach(()=> {
    aMark = {_id: 'id1', verse: {id: 'verse1'}};
    anotherMark = {_id: 'id2', verse: {id: 'verse2'}};
    verseIds = new Set([aMark.verse.id, anotherMark.verse.id]);
    markList = [aMark, anotherMark];
    validationService = {validateAll: stub()};
    markDao = {insert: stub(), removeFromVerses: stub(), findFromVerses: stub()};

    markService = new MarkService(markDao, validationService);
  });

  describe('#saveMarks()', function () {
    it('should validate the marks', function () {
      return assertThat
        .when(callingSaveMarks)

        .then(marksAreValidated);
    });

    it('should save the marks in the database', function () {
      return assertThat
        .when(callingSaveMarks)

        .then(marksAreSavedInTheDatabase);
    });

    it('should remove the old marks from the database', function () {
      return assertThat
        .when(callingSaveMarks)

        .then(oldMarksAreRemovedFromTheDatabase);
    });
  });

  describe('#getMarksForVerses()', function () {
    it('should find the verses from the database', function () {
      return assertThat
        .when(callingGetMarksForVerses)

        .then(marksAreRetrievedFromTheDatabase);
    });

    it('should check that the verse ids are strings', function () {
      return assertThat
        .given(verseIdsAreNonString)

        .when(callingGetMarksForVerses)

        .then(shouldHaveFailed, exceptionIsThrown);
    });
  });

  function exceptionIsThrown() {
  }

  function shouldHaveFailed() {
    throw new Error('Condition failed.');
  }

  function verseIdsAreNonString() {
    verseIds = new Set([1, 2]);
  }

  function callingGetMarksForVerses() {
    return markService.getMarksForVerses(USER_ID, verseIds);
  }

  function callingSaveMarks() {
    return markService.saveMarks(USER_ID, markList);
  }

  function marksAreValidated() {
    return assert.isTrue(validationService.validateAll.calledOnce);
  }

  function marksAreSavedInTheDatabase() {
    return assert.isTrue(markDao.insert.withArgs(markList).calledOnce);
  }

  function oldMarksAreRemovedFromTheDatabase() {
    return assert.isTrue(markDao.removeFromVerses.withArgs(USER_ID, verseIds, sinon.match.date).calledOnce);
  }

  function marksAreRetrievedFromTheDatabase() {
    return assert.isTrue(markDao.findFromVerses.withArgs(USER_ID, verseIds).calledOnce);
  }
});