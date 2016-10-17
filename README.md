# BartenderNode
NodeJS Server

# ExpressJS

ExpressJS is a micro-framework for service HTTP requests using
NodeJS. You can find more information about best practices
[here](https://expressjs.com/en/advanced/best-practice-performance.html).

# Usage

## After Initially Downloading

Run `yarn` or `npm install` to download dependencies.

## Starting Program

Run `npm start`

## Checking Code Against Style Guide

Run `npm run lint`

# Code

## Logging

Logging is handled by Winston <https://www.npmjs.com/package/winston>

You can change the default log level by setting the `LOG_LEVEL` environment
variables.

You can find more information on log levels [here](https://www.npmjs.com/package/winston#using-logging-levels).

## HTTP Server

The HTTP server is a simple ExpressJS application.

## JS Version

Code is transpiled from ECMAScript 2015 using Babel
(see .babelrc). 

You can find an excellent style guide for the new features
here <https://github.com/airbnb/javascript#ecmascript-6-es-2015-styles>

### Major Syntax Differences

#### Imports

It is advisable to use `import libName from 'package';`
rather than `var libName = require('package');`

You can find further documentation [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).

#### Template Literals

Whereas before you would have to insert variables into a string
using a syntax like `var stringName = 'static text: ' + varName;`
you can now use a template literal `var stringName = \`static text: ${varName}\``.

#### Consts and Vars

You can now declare a `const` in addition to declaring `var`'s. Generally
it is a good idea to start by declaring something `const` and then only
making it a `var` if you really have to. This is largely because it is
easier to debug things when there are no mutations.

<https://github.com/airbnb/javascript#references>

Note also that [let and const are block scoped](https://github.com/airbnb/javascript#references--block-scope).
