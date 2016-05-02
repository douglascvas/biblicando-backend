namespace exception {
  export class ValidationException extends Error {
    public status = 400;

    constructor(message:string) {
      super(message);
    }
  }
}