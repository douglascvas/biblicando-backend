export function Controller() {
  return function (target:any) {
    target.$controller = function () {
    }
  };
}