import * as Q from "q";

export class AssertThat {
  constructor(private lastPromise?:any) {
    this.given = this.wrapValueInPromise.bind(this);
    this.when = this.wrapValueInPromise.bind(this);
    this.then = this.wrapValueInPromise.bind(this);
  }

  public given:(value:any, extraArg?:any) => AssertThat;
  public when:(value:any, extraArg?:any) => AssertThat;
  public then:(value:any, extraArg?:any) => AssertThat;

  private isFunction(value) {
    return (typeof value === 'function');
  }

  private wrapValueInPromise(value?:any, extraArg?:any):AssertThat {
    var promise = Q.when(this.lastPromise).then(this.isFunction(value) ? value : ()=>value, extraArg);
    return new AssertThat(promise);
  }
}