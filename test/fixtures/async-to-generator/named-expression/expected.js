var foo = (() => {
  var ref = babelHelpers.asyncToGenerator(function* () {
    console.log(bar);
  });

  function bar() {
    return ref.apply(this, arguments);
  }

  return bar;
})();
