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
    if (!originalRegister) {
      throw new Error('The class must be annotated with "@Controller"');
    }
    target.$controller = function (app) {
      let method = methods[type];
      app[method](path, descriptor.value);
      if (originalRegister) {
        originalRegister(app);
      }
    };
  };
}