let foo = (() => {
  var ref = babelHelpers.asyncToGenerator(function* (bar) {});
  return function foo(bar) {
    return ref.apply(this, arguments);
  };
})();
