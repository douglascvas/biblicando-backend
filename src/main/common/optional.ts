export class Optional<E> {
  private constructor(private value: E|null) {
  }

  public static of<T>(value: T): Optional<T> {
    return new Optional<T>(value);
  }

  public isPresent(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  public static empty<T>(): Optional<any> {
    return new Optional<T>(null);
  }

  public get(): E {
    return this.value;
  }
}