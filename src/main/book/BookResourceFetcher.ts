'use strict';
import {BookDao} from "./BookDao";
import {Book} from "./Book";
import {Service} from "node-boot";
import {ResourceManager} from "../common/ResourceManager";

@Service
export class BookResourceFetcher {

  constructor(private bookDao: BookDao,
              private resourceManager: ResourceManager) {
  }

  public async fetchBooks(bibleId: string): Promise<Book[]> {
    return await this.resourceManager.getResources(bibleId, 'books', id => this.bookDao.findByBible(id));
  }

  public async fetchBook(bookId: string): Promise<Book> {
    return this.resourceManager.getResource(bookId, 'book', id => this.bookDao.findOne(id));
  }
}