export class Config {
  constructor(private configurator:any) {
  }

  public find(key:string):any {
    return this.configurator.get(key);
  }
}