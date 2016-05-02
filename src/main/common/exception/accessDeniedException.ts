namespace exception {

  export class AccessDeniedException extends Error {
    public status = 400;

    constructor(message) {
      super(message);
    }
  }
}
