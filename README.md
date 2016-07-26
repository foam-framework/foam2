# FOAM

Build fully featured high performance apps in less time using FOAM.

  * Application Speed
  * Application Size
  * Developer Efficiency

"Fast apps Fast"

[http://foamdev.com](http://foamdev.com)

[![Build Status](https://travis-ci.org/foam-framework/foam2-experimental.svg?branch=master)](https://travis-ci.org/foam-framework/foam2-experimental)

## Feature Oriented Active Modeller

FOAM is a modeling tool and class based object system.  To use FOAM,
you create a model of you class by describing the properties, methods,
event topics, listeners, and dependencies of your class.  FOAM takes
this model and generates a usable JavaScript class along with several
companion features such as database support and network marshaling.

While FOAM is written in JavaScript, it can be used to generate code
for any language or platform. Android Java and iOS Swift support are
planned features.

# Development

## Installing Dependencies

FOAM has no runtime dependencies, but uses a number of third party tools for
unit tests, code coverage, linting.  You can install all required
tools by doing the following.

* Install nodejs.

* Run 'npm install' in the root of the FOAM repository, where
  package.json is found.

## Style Guide

All code should folow the [style guide.](doc/guides/StyleGuide.md)

## Testing

* _npm test_ runs standard unit tests.

* _npm run testDebug_ runs the unit tests with a debugger.

* _npm run coverage_ runs code coverage and creates an html report in /coverage.

For in-browser testing, run your favorite web server at the root of the FOAM
repository. In a browser, navigate to
[http://localhost:8000/test/browser/SpecRunner.html](http://localhost:8000/test/browser/SpecRunner.html)
to run the unit tests.

# Documentation

* _npm run doc_ generates HTML API documentation in doc/gen/.

Documentation is created by JSDoc with a plugin to account for FOAM's package
structure and declarative nature. JSDoc modules correspond with FOAM packages.
See [./doc/Documentation.md](./doc/Documentation.md) for information on comment
formatting.

# Contributing

Before contributing code to FOAM, you must complete the [Google Individual Contributor License Agreement](https://cla.developers.google.com/about/google-individual?csw=1).
