var Q = require('q');

function AssertThat(lastPromise) {
  var self = this;
  self.given = wrapValueInPromise.bind(self);
  self.when = wrapValueInPromise.bind(self);
  self.then = wrapValueInPromise.bind(self);

  function isFunction(value) {
    return (typeof value === 'function');
  }

  function wrapValueInPromise(value, extraArg) {
    var promise = Q.when(lastPromise).then(isFunction(value) ? value : ()=>value, extraArg);
    return new AssertThat(promise);
  }
}

module.exports = AssertThat;