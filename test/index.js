var path = require('path');
var fs = require('fs');
var assert = require('assert');
var babel = require('babel-core');
var asyncToGenerator = require('../lib/');

var root = path.join(__dirname, 'fixtures');

describe('transform async to generator', function () {
  var files = fs.readdirSync(root);
  dfs(root);
});

function transform (filePath, options) {
  return babel.transformFileSync(filePath, options).code;
}

function dfs (currentPath, options) {
  if (fs.lstatSync(currentPath).isDirectory()) {
    try {
      options = JSON.parse(fs.readFileSync(path.join(currentPath, 'options.json')));
      if (options.plugins) {
        options.plugins = options.plugins.filter((plugin) => (plugin !== 'transform-async-to-generator'));
        options.plugins.push(asyncToGenerator);
      }
    } catch (e) {
      // nothing
    }

    var testCase = {};
    var files = fs.readdirSync(currentPath).filter((filename) => (filename !== 'options.json'));

    files.forEach(function (file) {
      Object.assign(testCase, dfs(path.join(currentPath, file), options));
    });

    if (testCase.input && testCase.output) {
      it(path.relative(root, currentPath).replace(/\//g, ' » '), function () {
        var res = transform(testCase.input, options);
        res = res.replace(/"use strict";/, '').trim();
        var expected = fs.readFileSync(testCase.output).toString().replace(/"use strict";/, '').trim();
        assert.strictEqual(res, expected);
      });
    }

    if (testCase.exec) {
      it(path.relative(root, currentPath).replace(/\//g, ' » '), function () {
        var res = transform(testCase.exec, options);
        require("babel-polyfill");
        eval(res);
      });
    }
  } else {
    var filename = path.parse(currentPath).base;
    switch (filename) {
      case 'actual.js':
        return {
          input: currentPath
        };
      case 'expected.js':
        return {
          output: currentPath
        };
      case 'exec.js':
        return {
          exec: currentPath
        };
      default:
      // nothing
    }
  }
}

