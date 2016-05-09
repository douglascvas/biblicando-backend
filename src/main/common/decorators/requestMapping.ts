export enum RequestType {
  GET,
  POST,
  PUT,
  DELETE
}

const methods = ['get', 'post', 'put', 'del'];

export function RequestMapping(path:string, type:RequestType) {
  type = type || RequestType.GET;
  return function (target:any, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
    var originalRegister = target.$controller;
    target.$controller = function (app, logger) {
      let method = methods[type];
      logger.debug(`Registering api - ${method.toUpperCase()} ${path}.`);
      app[method](path, descriptor.value);
      if (originalRegister) {
        originalRegister(app, logger);
      }
    };
  };
}