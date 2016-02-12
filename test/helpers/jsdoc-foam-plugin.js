/**
  This plugin is for JSDocs, to allow FOAM models to be documented.

  Document objects with a 'documentation' property, or put a JSDoc comment
  before their declaration as normal.

  ** Exception: **
  For properties or methods declared with object syntax, put the comment
  inside the object (or use a documentation property):
  {
    /** Comment goes here! * /
    name: 'thing'
  }

  For any other thing:

  {
    name: 'thing2',
    documentation: "Docs inside thing2"
  }

  or

  /** Comment before * /
  foam.CLASS({ 
    name: 'myClass',
    documentation: "or docs inside",
  })

  or 

  methods: [
    /** Comment before * /
    function aMethod() {}
  ]

  ** Note on docs inside a function **
  To enable this:
    function aMethod() { 
      /** doc as first comment in function * /
      func contents...
    }

  you have to modify JSDocs to enable internal 
  function comments. In astbuilder.js, 
  CommentAttacher.prototype.visit, Comment out 
  canAcceptComment (so that all comments are left in):
  if ( isEligible /*&& canAcceptComment(node)* / ) {


*/



var getNodePropertyNamed = function getNodePropertyNamed(node, propName) {
  if ( node.properties ) {
    for (var i = 0; i < node.properties.length; ++i) {
      var p = node.properties[i];
      if ( p.key && p.key.name == propName ) {
        return ( p.value && p.value.value ) || '';
      }
    }
  }
  return '';
}


var getLeadingComment = function getLeadingComment(node) {
  if (node.leadingComments) return node.leadingComments[0].raw;
  if (node.parent) {
    if (node.parent.leadingComments) return node.parent.leadingComments[0].raw;
    if (node.parent.callee) {
      if (node.parent.callee.leadingComments) return node.parent.callee.leadingComments[0].raw;
      if (node.parent.callee.parent) {
        if (node.parent.callee.parent.leadingComments) return node.parent.callee.parent.leadingComments[0].raw;
      }
    }
  }
  return '';
}

var getFuncBodyComment = function getFuncBodyComment(node) {
  //console.log(node.body.body[0]);
  if (  node.body && 
        node.body.body && 
        node.body.body[0] && 
        node.body.body[0].leadingComments ) {    
    return node.body.body[0].leadingComments[0].raw;
  }
  return '';
}

var getComment = function getComment(node) {
  // try for FOAM documentation property/in-function comment block
  // Object expression with documentation property
  var docProp = getNodePropertyNamed(node, 'documentation');
  if ( docProp ) {
    return docProp;
  }
  // function with potential block comment inside
  else if ( node.type === 'FunctionExpression' ) {
    var comment = getFuncBodyComment(node);
    if ( comment ) return comment;
  } 
  
  // fall back on standard JSDoc leading comment blocks
  return getLeadingComment(node);
  
}

var getCLASSName = function getCLASSName(node) {
  return getNodePropertyNamed(node, 'name');
}
var getCLASSExtends = function getCLASSExtends(node) {
  return getNodePropertyNamed(node, 'extends');
}

var insertIntoComment = function insertIntoComment(comment, tag) {
  var idx = comment.lastIndexOf('*/');
  return comment.slice(0, idx) + " "+tag+" " + comment.slice(idx);
}
var i = 0;
exports.astNodeVisitor = {
  visitNode: function(node, e, parser, currentSourceName) {
    //if (node.type == 'ObjectExpression') console.log("*****\n",node, "\nparent:", node.parent);
    //console.log(node.parent);

    //if (20 ==  i++) console.log("parser: ",parser._astBuilder);
    
    // CLASS or LIB 
    if (node.type === 'ObjectExpression' &&
      node.parent && node.parent.type === 'CallExpression' &&
      node.parent.callee && node.parent.callee.property &&
      ( node.parent.callee.property.name == 'CLASS' || node.parent.callee.property.name == 'LIB' )
    ) {
      var className = getCLASSName(node);
      var classExt = getCLASSExtends(node);
      e.id = 'astnode'+Date.now();
      e.comment = insertIntoComment(
        getComment(node),
        "\n@class " +
        (( classExt ) ? "\n@extends module:foam."+classExt : "") +
        "\n@memberof! module:foam"
      );
      e.lineno = node.parent.loc.start.line;
      e.filename = currentSourceName;
      e.astnode = node;
      e.code = {
          name: className,
          type: "class",
          node: node
      };
      e.event = "symbolFound";
      e.finishers = [parser.addDocletRef];


    } // function in an array (methods, todo: listeners, etc)
    else if (node.type === 'FunctionExpression' &&
      node.parent.type === 'ArrayExpression' &&
      node.parent.parent.type === 'Property' &&
      node.parent.parent.key.name === 'methods'
    ) {
      var parentClass = getCLASSName(node.parent.parent.parent);
      e.id = 'astnode'+Date.now();
      e.comment = insertIntoComment(
        getComment(node),
        "\n@method \n@memberof! module:foam."+parentClass + ".prototype"
      );
      e.lineno = node.parent.loc.start.line;
      e.filename = currentSourceName;
      e.astnode = node;
      e.code = {
          name: (node.id && node.id.name || 'NameError'),
          type: "function",
          node: node
      };
      e.event = "symbolFound";
      e.finishers = [parser.addDocletRef];

      //console.log("found method", e);
    } // objects in an array (properties, methods, todo: others)
    else if (node.type === 'ObjectExpression' &&
      node.parent.type === 'ArrayExpression' &&
      node.parent.parent.type === 'Property' &&
      ( node.parent.parent.key.name === 'properties' ||
        node.parent.parent.key.name === 'methods' )
    ) {
      var parentClass = getCLASSName(node.parent.parent.parent);
      e.id = 'astnode'+Date.now();
      e.comment = insertIntoComment(
        getComment(node.properties[0]) || getComment(node),
        ( node.parent.parent.key.name === 'methods' ) ? "\n@method " : "" +
          "\n@memberof! module:foam."+parentClass + ".prototype"
      );
      e.lineno = node.parent.loc.start.line;
      e.filename = currentSourceName;
      e.astnode = node;
      e.code = {
          name: getCLASSName(node),
          type: "property",
          node: node
      };
      e.event = "symbolFound";
      e.finishers = [parser.addDocletRef];

      //console.log("found prop parent", e.code.name, node.parent.elements);
    }
  }
};
