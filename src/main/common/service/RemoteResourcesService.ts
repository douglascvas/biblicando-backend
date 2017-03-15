import {RemoteApiInfo} from "../enums/RemoteApiInfo";
import {RemoteApiInfoService} from "./RemoteApiInfoService";
import {Bible} from "../../bible/Bible";
import {RemoteService} from "../interface/remoteService";
import {BibleDao} from "../../bible/BibleDao";
import {ResourceManager} from "../ResourceManager";
import {Book} from "../../book/Book";
import {BookDao} from "../../book/BookDao";
import {Chapter} from "../../chapter/Chapter";
import {ChapterDao} from "../../chapter/ChapterDao";
import {Service} from "node-boot";

@Service
export class RemoteResourcesService {

  constructor(private remoteApiInfoService: RemoteApiInfoService,
              private bibleDao: BibleDao,
              private bookDao: BookDao,
              private chapterDao: ChapterDao,
              private resourceManager: ResourceManager) {

  }

  public async synchronize() {
    let remoteBibles: Bible[] = await this.fetchBiblesFromRemote();
    let bibles: Bible[] = <Bible[]>await Promise.all(remoteBibles.map((bible: Bible) => this.saveBibleInDatabaseAndCache(bible)));
    this.resourceManager.saveToCache('', 'bibles', bibles);
  }

  private async fetchBiblesFromRemote(): Promise<Bible[]> {
    const remoteApiInfo: RemoteApiInfo[] = this.remoteApiInfoService.listAll();
    const bibles: Bible[] = (<Bible[][]>await Promise.all(remoteApiInfo.map((info: RemoteApiInfo) => this.fetchBiblesFromRemoteApi(info))))
      .reduce((acumulator, bibles: Bible[]) => [].concat(acumulator, bibles), []);
    return bibles;
  }

  private async fetchBiblesFromRemoteApi(info: RemoteApiInfo): Promise<Bible[]> {
    const remoteService: RemoteService = this.remoteApiInfoService.getService(info.name);
    return remoteService ? await remoteService.getBibles() : [];
  }

  private async saveBibleInDatabaseAndCache(remoteBible: Bible): Promise<Bible> {
    let bible: Bible = <Bible>await this.bibleDao.updateRemoteResource(remoteBible, {upsert: true});
    this.resourceManager.saveToCache(bible._id, 'bible', bible);
    await this.synchronizeBooksForBible(bible);
    return bible;
  }

  private async synchronizeBooksForBible(bible: Bible): Promise<void> {
    const remoteService: RemoteService = this.remoteApiInfoService.getService(bible.remoteSource);
    const books: Book[] = remoteService ? await remoteService.getBooks(bible.remoteId) : [];
    books.map(book => this.saveBookInDatabaseAndCache(book));
  }

  private async saveBookInDatabaseAndCache(book: Book): Promise<void> {
    this.bookDao.updateRemoteResource(book);
    this.resourceManager.saveToCache(book._id, 'book', book);
    this.synchronizeChaptersForBook(book);
  }

  private async synchronizeChaptersForBook(book: Book): Promise<void> {
    const remoteService: RemoteService = this.remoteApiInfoService.getService(book.remoteSource);
    const chapters: Chapter[] = remoteService ? await remoteService.getChapters(book.remoteId) : [];
    chapters.map(chapter => this.saveChapterInDatabaseAndCache(chapter));
  }

  private async saveChapterInDatabaseAndCache(chapter: Chapter): Promise<void> {
    this.chapterDao.updateRemoteResource(chapter);
    this.resourceManager.saveToCache(chapter._id, 'chapter', chapter);
  }
}