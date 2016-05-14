import {LoggerFactory} from "../loggerFactory";
export function Controller(target:any) {
  target.prototype.$controller = target.prototype.$controller || {apis: new Set()};
  var apis:Set<any> = target.prototype.$controller.apis;
  target.prototype.$controller.register = function (app, loggerFactory:LoggerFactory) {
    var logger = loggerFactory.getLogger('Controller');
    for (let api of apis.values()) {
      api(app, logger);
    }
  }
}