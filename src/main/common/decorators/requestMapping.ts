export class RequestType {
  static GET = new RequestType('get');
  static POST = new RequestType('post');
  static PUT = new RequestType('put');
  static DELETE = new RequestType('delete');

  constructor(private _value) {
  }

  get value() {
    return this._value;
  }
}

export function RequestMapping(path:string, type?:RequestType) {
  type = type || RequestType.GET;
  var self = this;
  return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
    target.$controller = target.$controller || {apis: new Set()};
    function registerApi(app, controllerInstance, logger) {
      let method = type.value;
      logger.debug(`Registering api - ${method.toUpperCase()} ${path}.`);
      app[method](path, descriptor.value.bind(controllerInstance));
    }

    target.$controller.apis.add(registerApi);
  };
}