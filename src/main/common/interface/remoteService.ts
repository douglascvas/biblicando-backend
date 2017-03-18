import {Bible} from "../../bible/Bible";
import {Book} from "../../book/Book";
import {Chapter} from "../../chapter/Chapter";
import {Verse} from "../../verse/Verse";

export interface RemoteService {
  getBibles(): Promise<Bible[]>;
  getBible(bibleId: string): Promise<Bible>;

  getBooks(bibleCode: string): Promise<Book[]>;
  getBook(bookId: string): Promise<Book>;

  getChapters(bookCode: string): Promise<Chapter[]>;
  getBooks(bookCode: string): Promise<Book[]>;

  getVerses(chapterCode: string): Promise<Verse[]>;
}