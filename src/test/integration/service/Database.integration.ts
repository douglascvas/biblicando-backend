// 'use strict';
//
// import * as path from "path";
// import * as assert from "assert";
// import {AssertThat} from "../../assertThat";
// import {TestTool} from "./testTool";
// import {BibleDao} from "../../../main/bible/bibleDao";
// import * as uuid from "node-uuid";
// import {Bible} from "../../../main/bible/bible";
//
// const Configurator = require('configurator-js');
// const CONFIG_PATH = path.resolve(__dirname, '../config/config.yml');
// const config = new Configurator(CONFIG_PATH, 'biblicando');
//
// describe('BibleDao', function () {
//   let bible: Bible;
//   let bibleDao: BibleDao;
//   let testTool: TestTool;
//   let assertThat: AssertThat;
//
//   before(() => {
//     assertThat = new AssertThat();
//     testTool = new TestTool();
//     return testTool.initialize(false)
//       .then(() => {
//         bibleDao = testTool.dependencyInjector.get(BibleDao);
//       });
//   });
//
//   beforeEach(() => {
//     bible = getBible();
//   });
//
//   it('should save and retrieve a bible from database', function () {
//     return assertThat
//       .when(() => bibleDao.findOneByName(bible.name))
//
//       .then(value => assert.equal(value, null))
//
//       .given(() => bibleDao.insertOne(bible))
//
//       .when(() => bibleDao.findOneByName(bible.name))
//
//       .then(value => assert.deepEqual(value, bible));
//   });
//
//   function getBible() {
//     const bible: Bible = <Bible>{};
//     bible.abbreviation = 'test-abbr';
//     bible.copyright = 'protected trademark';
//     bible.description = 'test';
//     bible.publisher = 'some publisher';
//     bible.name = getTestName();
//     bible.languageCode = 'en';
//     bible.remoteId = 'test-bible-1';
//     bible.remoteSource = 'remoteSite';
//     return bible;
//   }
//
//   function getTestName() {
//     return 'test--' + uuid.v1();
//   }
//
//   function wait(timeout) {
//     return function () {
//       return new Promise((resolve, reject) => {
//         setTimeout(() => resolve(), timeout);
//       });
//     }
//   }
//
// });