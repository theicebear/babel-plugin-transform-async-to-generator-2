[![Build Status](https://travis-ci.org/theicebear/babel-plugin-transform-async-to-generator-2.svg?branch=master)](https://travis-ci.org/theicebear/babel-plugin-transform-async-to-generator-2)

# babel-plugin-transform-async-to-generator-2

A fork of `babel-plugin-transform-async-to-generator`, with a little difference that this plugin keeps the original parameter names of an async function.

## Installation

```sh
$ npm install babel-plugin-transform-async-to-generator-2
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-async-to-generator-2"]
}
```

### Via CLI

```sh
$ babel --plugins transform-async-to-generator-2 script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-async-to-generator-2"]
});
```
