"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (path, callId) {
  let node = path.node;
  if (node.generator) return;

  path.traverse(awaitVisitor);

  if (path.isClassMethod() || path.isObjectMethod()) {
    return classOrObjectMethod(path, callId);
  } else {
    return plainFunction(path, callId);
  }
};

var _babelHelperFunctionName = require("babel-helper-function-name");

var _babelHelperFunctionName2 = _interopRequireDefault(_babelHelperFunctionName);

var _babelTemplate = require("babel-template");

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let buildWrapper = (0, _babelTemplate2.default)(`
  (() => {
    var ref = FUNCTION;
    return function NAME(PARAMS) {
      return ref.apply(this, arguments);
    };
  })
`);

let namedBuildWrapper = (0, _babelTemplate2.default)(`
  (() => {
    var ref = FUNCTION;
    function NAME(PARAMS) {
      return ref.apply(this, arguments);
    }
    return NAME;
  })
`);

let awaitVisitor = {
  ArrowFunctionExpression(path) {
    if (!path.node.async) {
      path.arrowFunctionToShadowed();
    }
  },

  AwaitExpression(_ref) {
    let node = _ref.node;

    node.type = "YieldExpression";
  }
};

function classOrObjectMethod(path, callId) {
  let node = path.node;
  let body = node.body;

  node.async = false;

  let container = t.functionExpression(null, [], t.blockStatement(body.body), true);
  container.shadow = true;
  body.body = [t.returnStatement(t.callExpression(t.callExpression(callId, [container]), []))];
}

function plainFunction(path, callId) {
  let node = path.node;
  let isDeclaration = path.isFunctionDeclaration();
  let asyncFnId = node.id;
  let wrapper = buildWrapper;

  if (path.isArrowFunctionExpression()) {
    path.arrowFunctionToShadowed();
  } else if (!isDeclaration && asyncFnId) {
    wrapper = namedBuildWrapper;
  }

  node.async = false;
  node.generator = true;

  node.id = null;

  if (isDeclaration) {
    node.type = "FunctionExpression";
  }

  let built = t.callExpression(callId, [node]);
  let container = wrapper({
    NAME: asyncFnId,
    FUNCTION: built,
    PARAMS: node.params
  }).expression;

  if (isDeclaration) {
    let declar = t.variableDeclaration("let", [t.variableDeclarator(t.identifier(asyncFnId.name), t.callExpression(container, []))]);
    declar._blockHoist = true;

    path.replaceWith(declar);
  } else {
    let retFunction = container.body.body[1].argument;
    if (!asyncFnId) {
      (0, _babelHelperFunctionName2.default)({
        node: retFunction,
        parent: path.parent,
        scope: path.scope
      });
    }

    if (!retFunction || retFunction.id || node.params.length) {
      // we have an inferred function id or params so we need this wrapper
      path.replaceWith(t.callExpression(container, []));
    } else {
      // we can omit this wrapper as the conditions it protects for do not apply
      path.replaceWith(built);
    }
  }
}

module.exports = exports['default'];