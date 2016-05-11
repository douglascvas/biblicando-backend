import * as Q from 'q';
import IPromise = Q.IPromise;

export class AssertThat {
  constructor(private lastPromise?:any) {
    this.given = this.wrapValueInPromise.bind(this);
    this.when = this.wrapValueInPromise.bind(this);
    this.then = this.wrapValueInPromise.bind(this);
  }

  public given;
  public when;
  public then;

  private isFunction(value) {
    return (typeof value === 'function');
  }

  private wrapValueInPromise(value:any, extraArg:any) {
    var promise = Q.when(this.lastPromise).then(this.isFunction(value) ? value : ()=>value, extraArg);
    return new AssertThat(promise);
  }
}