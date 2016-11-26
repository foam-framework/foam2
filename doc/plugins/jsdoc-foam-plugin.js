/**
  This plugin is for JSDocs, to allow FOAM models to be documented.

  Document objects with a 'documentation' property, or put a JSDoc comment
  before their declaration as normal.

  ** Exceptions: **
  For properties declared with object syntax, put the comment
  inside the object (or use a documentation property):
  {
    /** Comment goes here! * /
    name: 'thing'
  }

  For methods and listeners, put the comment inside the function body
  as the first statement:
  methods: [
    function aMethod(arg1) {
      /** doc as first comment in function
        @param arg1 {any} Argument docs * /
      func contents...
    }
  ]

  For any other thing:

  {
    name: 'thing2',
    documentation: 'Docs inside thing2'
  }

  or

  /** Comment before * /
  foam.CLASS({
    name: 'myClass',
    documentation: 'or docs inside',
  })

*/

var fs = require('fs');
var exports;
require("../../src/foam.js");

var modelComments = {};

var getNodePropertyNamed = function getNodePropertyNamed(node, propName) {
  if ( node.properties ) {
    for ( var i = 0; i < node.properties.length; ++i ) {
      var p = node.properties[i];
      if ( p.key && p.key.name === propName ) {
        return ( p.value && p.value.value ) ||
          ( p.value && p.value.elements ) ||
          ( p.value ) ||
          '';
      }
    }
  }
  return '';
};

var getNodeNamed = function getNodeNamed(node, propName) {
  if ( node.properties ) {
    for ( var i = 0; i < node.properties.length; ++i ) {
      var p = node.properties[i];
      if ( p.key && p.key.name === propName ) {
        return p.value;
      }
    }
  }
  return '';
};


var getLeadingComment = function getLeadingComment(node) {
  // climb up the tree and look for a docs comment
  if ( node.leadingComments ) {
    return node.leadingComments[0].raw;
  }
  if ( node.parent ) {
    if ( node.parent.leadingComments ) {
      return node.parent.leadingComments[0].raw;
    }
    if ( node.parent.callee ) {
      if ( node.parent.callee.leadingComments ) {
        return node.parent.callee.leadingComments[0].raw;
      }
      if ( node.parent.callee.parent ) {
        if ( node.parent.callee.parent.leadingComments ) {
          return node.parent.callee.parent.leadingComments[0].raw;
        }
      }
    }
  }
  return '';
};

var getFuncBodyComment = function getFuncBodyComment(node, filename) {
  // try to pull a comment from the function body
  var src = getSourceString(filename, node.range[0], node.range[1]);
  var matches = src.match(/function[^]*?\([^]*?\)[^]*?\{[^]*?(\/\*\*[^]*?\*\/)/);
  if ( matches && matches[1] ) {
    return matches[1];
  } else {
    // fallback: there might be a parsed comment left behind if the first statement
    // of the function is on the JSDocs 'good' list
    if ( node.body &&
         node.body.body &&
         node.body.body[0] &&
         node.body.body[0].leadingComments ) {
      return node.body.body[0].leadingComments[0].raw;
    }
    return '';
  }
};

var getComment = function getComment(node, filename) {
  var comment;
  // try for FOAM documentation property/in-function comment block
  // Object expression with documentation property
  var docProp = getNodePropertyNamed(node, 'documentation');
  if ( docProp ) {
    return '/** ' + docProp + ' */';
  }
  // function with potential block comment inside
  else if ( node.type === 'FunctionExpression' ||
      node.type === 'CallExpression' ) {
    comment = getFuncBodyComment(node, filename);
  }
  // object-style method declaration with comment inside funciton code block
  else if ( node.type === 'ObjectExpression' ) {
    var codeNode = getNodePropertyNamed(node, 'code');
    comment = getComment(codeNode, filename);
  }
  if ( comment ) return comment;

  // fall back on standard JSDoc leading comment blocks
  return getLeadingComment(node);

};

var getDefinitionType = function getDefinitionType(node) {
  if ( node.type === 'ObjectExpression' &&
      node.parent && node.parent.type === 'CallExpression' &&
      node.parent.callee && node.parent.callee.property ) {
    var name = node.parent.callee.property.name;
    if ( name === 'CLASS' || name === 'LIB' || name === 'INTERFACE' ) {
      return name;
    }
  }
  return '';
};

var getCLASSPackage = function getCLASSPackage(node) {

  var pkg = getNodePropertyNamed(node, 'package').replace(/\./g, '/');
  if ( ! pkg ) {
    if ( getDefinitionType(node) === 'LIB' ) {
      pkg = getNodePropertyNamed(node, 'name').replace(/\./g, '/');
      pkg = pkg.substring(0, pkg.lastIndexOf('/'));
    } else {
      pkg = 'foam/core';
    }
  }

  return pkg;
};

var getCLASSName = function getCLASSName(node) {
  var name = getNodePropertyNamed(node, 'name');
  var pkg = getCLASSPackage(node);

  if ( ! name || ! foam.String.isInstance(name) ) {
    var classRefines = getCLASSPath(node, 'refines');
    if ( classRefines ) {
      // name the model to match the one it refines
      var i = classRefines.lastIndexOf('.');
      if ( i > 0 ) {
        name = classRefines.substring(i + 1);
        pkg = classRefines.substring(0, i);
      }
    }
  }

  if ( ! foam.String.isInstance(name) ) return '';

  var j = name.lastIndexOf('.');
  if ( j > 0 ) {
    name = name.substring(j + 1);
  }
  return ( pkg ? 'module:' + pkg + '.' : '' ) + name;
};

var getCLASSPath = function getCLASSPath(node, name) {
  var ext = getNodePropertyNamed(node, name);
  if ( ext ) {
    // replace package dots with module slashes
    ext = ext.replace(/\./g, '/');
    var i = ext.lastIndexOf('/');
    if ( i > 0 ) {
      ext = ext.substring(0, i) + '.' + ext.substring(i + 1);
    } else {
      ext = 'foam/core.' + ext;
    }
  }
  return ext;
};

var insertIntoComment = function insertIntoComment(comment, tag) {
  var idx = comment.lastIndexOf('*/');
  return comment.slice(0, idx) + ' ' + tag + ' ' + comment.slice(idx);
};

var replaceCommentArg = function replaceCommentArg(
    comment, name, type, optional, repeats, docs
  ) {
  // if the @arg is defined in the comment, add the type, otherwise insert
  // the @arg directive. Documentation (if any) from the argument declaration
  // is only used if the @arg is not specified in the original comment.
  var found = false;
  var ret = comment.replace(
    new RegExp('(@param|@arg)\\s*({.*?})?\\s*' + name + '\\s', 'gm'),
    function(match, p1, p2) {
      found = true;
      if ( p2 ) return match; // a type was specified, abort
      return p1 + ' {' + ( repeats ? '...' : '' ) + type +
        ( optional ? '=' : '' ) + '} ' + name + ' ';
    }
  );

  if ( found ) return ret;
  return insertIntoComment(comment, '\n@arg {' + ( repeats ? '...' : '' ) +
    type + ( optional ? '=' : '' ) + '} ' + name + ' ' + docs);
};


var files = {};
var getSourceString = function getSourceString(filename, start, end) {
  // Load the given file and find the original unparsed source
  var file;
  if ( ! files[filename] ) {
    files[filename] = fs.readFileSync(filename, 'utf8');
  }
  file = files[filename];

  var source = file.substring(start, end).trim();

  // HACK to support memoize1'd function bodies
  if ( ! source.startsWith('function') ) {
    // assume anything not starting with function must have a wrapper around it
    source = source.substring(source.indexOf('(') + 1, source.lastIndexOf(')'));
  }
  return source;
};

var processArgs = function processArgs(e, node) {
  // extract arg types using FOAM
  if ( ! node ) return;
  var src = getSourceString(e.filename, node.range[0], node.range[1]);
  try {
    var args = foam.types.getFunctionArgs(src);
    for ( var i = 0; i < args.length; ++i ) {
      var arg = args[i];
      if ( arg.typeName ) {
        e.comment = replaceCommentArg(e.comment, arg.name, arg.typeName,
          arg.optional, arg.repeats, arg.documentation);
      }
    }
  } catch ( err ) {
    console.log('Args not processed for ', err);
  }
};

var getImplements = function getImplements(node) {
  var ret = [];
  var nodes = getNodePropertyNamed(node, 'implements');
  for ( var i = 0; i < nodes.length; i++ ) {
    ret.push(nodes[i].value);
  }
  return ret;
};

// Looks up existing results (already had their comment processed)
var getResult = function getResult(parser, longname) {
  // also update .description on a result, to change the output text.
  if ( ! parser._resultBuffer ) return null;
  var name = 'module:' + longname;
  var rb = parser._resultBuffer;
  for ( var i = 0; i < rb.length; ++i ) {
    if ( rb[i].longname === name ) return rb[i];
  }
  return null;
};

var checkForPackageModule = function checkForPackageModule(parser, pkg) {

  if ( ! pkg ) return;

  var existing = getResult(parser, pkg);

  if ( ! existing ) {
    parser._resultBuffer.push(
      {
        comment: '/**\n @module' + pkg + '\n */',
        kind: 'module',
        name: pkg,
        longname: 'module:' + pkg
      }
    );
  }
};

var isMethod = function isMethod(containerName) {
  return containerName === 'methods' || containerName === 'listeners';
};

var i = 0;
exports.astNodeVisitor = {
  visitNode: function(node, e, parser, currentSourceName) {
    // NOTE: JSDocs strips comments it thinks are not useful. We get around this
    //       by loading the actual source file and pulling strings from it when
    //       necessary.

    // TODO: generalize for listeners and other things.

    // JSDoc hax:
    // For already generated items in the parser._resultBuffer, we can
    // look them up and modify the generated .comment (raw) and .description
    // (what ends up in the output template).

    // CLASS or LIB or INTERFACE
    if ( getDefinitionType(node) ) {
      var defType = getDefinitionType(node);
      var className = getNodePropertyNamed(node, 'name');
      var classPackage = getCLASSPackage(node);
      var classExt = getCLASSPath(node, 'extends');

      // for LIBs, className contains the package too. Strip it.
      if ( className.lastIndexOf('.') > 0 ) {
        className = className.substring(className.lastIndexOf('.'));
      }

      // check if the package exists as a module yet, create one if necessary
      checkForPackageModule(parser, classPackage);

      // If refining, just attach the comment to the original model
      var classRefines = getCLASSPath(node, 'refines');
      if ( classRefines ) {
        if ( ! modelComments[classRefines] ) {
          modelComments[classRefines] = {
            _queue: [],
            append: function append(str) {
              this._queue.push(str);
            }
          };
        }
        modelComments[classRefines]
          .append(getComment(node, currentSourceName));
        return;
      }

      var strBody =
        ( defType === 'INTERFACE' ? '\n@interface ' : '\n@class ' ) +
        ( ( classExt ) ? '\n@extends module:' + classExt : '');

      var classImplements = getImplements(node);
      if ( classImplements ) {
        for ( var i = 0; i < classImplements.length; i++ ) {
          strBody += '\n@implements ' + classImplements[i];
        }
      }

      strBody += (classPackage ? '\n@memberof! module:' +
        classPackage : '\n@global') + '';


      e.id = 'astnode' + Date.now();
      e.comment = insertIntoComment(
        getComment(node, currentSourceName),
        strBody
      );
      e.lineno = node.parent.loc.start.line;
      e.filename = currentSourceName;
      e.astnode = node;
      e.code = {
        name: className,
        type: ( defType === 'INTERFACE' ? 'interface' : 'class' ),
        node: node
      };
      e.event = 'symbolFound';
      e.finishers = [ parser.addDocletRef ];

      // store for possible future refinements, incorporate existing refinement comments
      if ( ! modelComments[classPackage + '.' + className] ) {
        modelComments[classPackage + '.' + className] = { _queue: [] };
      }
      var mc = modelComments[classPackage + '.' + className];
      mc.e = e;
      var oldAppend = mc.append = function(str) {
        var clsIdx = Math.max( // move tags to end
          mc.e.comment.lastIndexOf('@class'),
          mc.e.comment.lastIndexOf('@interface')
        );
        var trimmed = str.replace('*/', '').replace('/**', '');
        mc.e.comment = mc.e.comment.substr(0, clsIdx) +
           trimmed + '\n' +
           mc.e.comment.substr(clsIdx);
        mc.e.description += '\n' + trimmed;
      };
      for ( var i = 0; i < mc._queue.length; ++i ) {
        mc.append(mc._queue[i]);
      }
      mc._queue = [];
      // in future, look up the result for this doclet
      mc.append = function(str) {
        var r = getResult(parser,
          ( classPackage ? classPackage : 'foam.core' ) + '.' + className);
        if ( r ) {
          mc.e = r;
          oldAppend(str);
        }
      };

      //console.log('++++++++++++++++++', parser._resultBuffer);
      //console.log('********',e.comment, className, classPackage);

    } // function in an array (methods, todo: listeners, etc)
    else if ( node.type === 'FunctionExpression' &&
      node.parent.type === 'ArrayExpression' &&
      node.parent.parent.type === 'Property' &&
      isMethod(node.parent.parent.key.name)
    ) {
      var parentClass = getCLASSName(node.parent.parent.parent);

      e.id = 'astnode' + Date.now();
      e.comment = insertIntoComment(
        getComment(node, currentSourceName),
        '\n@method' +
        '\n@memberof! ' + parentClass + '.prototype'
      );
      e.lineno = node.parent.loc.start.line;
      e.filename = currentSourceName;
      e.astnode = node;
      e.code = {
        name: (node.id && node.id.name || 'NameError'),
        type: 'function',
        node: node
      };
      e.event = 'symbolFound';
      e.finishers = [ parser.addDocletRef ];

      processArgs(e, node);

    } // objects in an array (properties, methods, todo: others)
    else if ( node.type === 'ObjectExpression' &&
      node.parent.type === 'ArrayExpression' &&
      node.parent.parent.type === 'Property' &&
      ( node.parent.parent.key.name === 'properties' ||
        isMethod(node.parent.parent.key.name) )
    ) {
      var parentClass = getCLASSName(node.parent.parent.parent);
      e.id = 'astnode' + Date.now();
      e.comment = insertIntoComment(
        getComment(node.properties[0], currentSourceName) ||
        getComment(node, currentSourceName),
        (( isMethod(node.parent.parent.key.name) ) ? '\n@method ' : '') +
          '\n@memberof! ' + parentClass + '.prototype'
      );
      e.lineno = node.parent.loc.start.line;
      e.filename = currentSourceName;
      e.astnode = node;
      e.code = {
        name: getNodePropertyNamed(node,'name'),
        type: 'property',
        node: node
      };
      e.event = 'symbolFound';
      e.finishers = [ parser.addDocletRef ];

      if ( node.parent.parent.key.name === 'methods' ) {
        processArgs(e, getNodeNamed(node, 'code'));
      }
    }
  }
};
