var getCLASSComment = function getCLASSComment(node) {
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

var getComment = function getComment(node) {
  if (node.leadingComments) return node.leadingComments[0].raw;
  return getCLASSComment(node);
}


var getCLASSName = function getCLASSName(node) {
  if ( node.properties ) {
    //console.log("props", node.properties);
    for (var i = 0; i < node.properties.length; ++i) {
      var p = node.properties[i];
      if ( p.key && p.key.name == 'name' ) {
        return ( p.value && p.value.value ) || 'NameError';
      }
    }
  }
  return 'NameNotFound';
}

var insertIntoComment = function insertIntoComment(comment, tag) {
  var idx = comment.lastIndexOf('*/');
  return comment.slice(0, idx) + " "+tag+" " + comment.slice(idx);
}

exports.astNodeVisitor = {
  visitNode: function(node, e, parser, currentSourceName) {
    //if (node.type == 'ObjectExpression') console.log("*****\n",node, "\nparent:", node.parent);
    //console.log(node.parent);

    if (node.type === 'ObjectExpression' &&
      node.parent && node.parent.type === 'CallExpression' &&
      node.parent.callee && node.parent.callee.property &&
      ( node.parent.callee.property.name == 'CLASS' || node.parent.callee.property.name == 'LIB' )
    ) {
      var className = getCLASSName(node);
      e.id = 'astnode'+Date.now();
      e.comment = insertIntoComment(getCLASSComment(node), "\n@class \n@memberof! module:foam" );
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
    }
    else if (node.type === 'FunctionExpression' &&
      node.parent.type === 'ArrayExpression' &&
      node.parent.parent.type === 'Property' &&
      node.parent.parent.key.name === 'methods'
    ) {
      var parentClass = getCLASSName(node.parent.parent.parent);
      e.id = 'astnode'+Date.now();
      e.comment = insertIntoComment(
        getComment(node),
        "\n@function \n@memberof! module:foam."+parentClass + ".prototype"
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
    }
  }
};
