import {LoggerFactory} from "../loggerFactory";
export function Controller(target:any) {
  var self = this;
  target.prototype.$controller = target.prototype.$controller || {apis: new Set()};
  var apis:Set<any> = target.prototype.$controller.apis;
  target.prototype.$controller.instance = target;
  target.douglas = target;
  target.prototype.$controller.register = function (app, controllerInstance, loggerFactory:LoggerFactory) {
    var logger = loggerFactory.getLogger('Controller');
    for (let api of apis.values()) {
      api(app, controllerInstance, logger);
    }
  }
}