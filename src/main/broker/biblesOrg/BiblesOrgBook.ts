'use strict';
import {Broker} from "../../common/enums/Broker";
import {Book} from "../../book/Book";

export class BiblesOrgBook {
  id:string;
  name:string;
  ord:number;
  lang_code:string;
  osis_end:string;
  testament:string;
  version_id:string;
  book_group_id:string;
  copyright:string;
  chapters:Array<any>;

  public static toBook(biblesOrgBook: BiblesOrgBook):Book {
    const chapters = biblesOrgBook.chapters || [];

    var book:Book = <Book>{};
    book.copyright = biblesOrgBook.copyright;
    book.name = biblesOrgBook.name;
    book.number = biblesOrgBook.ord;
    book.numberOfChapters = chapters.length;
    book.updatedAt = new Date();
    book.remoteId = biblesOrgBook.id;
    book.remoteSource = Broker.BIBLES_ORG.value;
    book.testament = biblesOrgBook.testament;
    if(isNaN(book.number)){
      return null;
    }
    return book;
  }
}
