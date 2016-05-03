export function Inject() {
  return function (target) {
    target.$inject = true;
  };
}