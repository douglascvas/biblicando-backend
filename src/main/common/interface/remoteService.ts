import {Bible} from "../../bible/bible";
import {Book} from "../../book/book";
import {Chapter} from "../../chapter/chapter";
import {Verse} from "../../verse/verse";
import {Optional} from "../optional";

export interface RemoteService {
  getBibles(): Promise<Bible[]>;
  getBible(bibleId: string): Promise<Optional<Bible>>;

  getBooks(bibleCode: string): Promise<Book[]>;
  getBook(bookId: string): Promise<Optional<Book>>;

  getChapters(bookCode: string): Promise<Chapter[]>;
  getBooks(bookCode: string): Promise<Book[]>;

  getVerses(chapterCode: string): Promise<Verse[]>;
}