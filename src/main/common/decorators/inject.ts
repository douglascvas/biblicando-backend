namespace common {
  export function Inject(...args) {
    return function (target:Object, propertyKey:string, descriptor:TypedPropertyDescriptor<any>) {
      descriptor.value.$inject = args;
    };
  }
}