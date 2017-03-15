export class SchemaType {
  static STRING = new SchemaType('string');
  static INTEGER = new SchemaType('integer');
  static DATE = new SchemaType('date');
  static OBJECT = new SchemaType('object');
  static NUMBER = new SchemaType('number');
  static ARRAY = new SchemaType('array');

  constructor(public value) {
  }
}