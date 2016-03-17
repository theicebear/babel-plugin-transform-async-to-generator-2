let TestClass = {
  name: "John Doe",

  testMethodFailure() {
    var _this = this;

    return new Promise((() => {
      var ref = babelHelpers.asyncToGenerator(function* (resolve) {
        console.log(_this);
        setTimeout(resolve, 1000);
      });
      return function (resolve) {
        return ref.apply(this, arguments);
      };
    })());
  }
};
