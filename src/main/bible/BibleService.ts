import {Bible} from "./Bible";
import {Service} from "node-boot";
import {BibleResourceFetcher} from "./BibleResourceFetcher";

@Service
export class BibleService {

  constructor(private bibleResourceFetcher: BibleResourceFetcher) {
  }

  public findBibles(): Promise<Bible[]> {
    return this.bibleResourceFetcher.fetchBibles();
  }


  public findBible(bibleId: string): Promise<Bible> {
    if (!bibleId) {
      return null;
    }
    return this.bibleResourceFetcher.fetchBible(bibleId);
  }

}