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

exports.astNodeVisitor = {
    visitNode: function(node, e, parser, currentSourceName) {
        //if (node.type == 'ObjectExpression') console.log("*****\n",node, "\nparent:", node.parent);
        //console.log(node.parent);

        if (node.type === 'ObjectExpression' &&
            node.parent && node.parent.type === 'CallExpression' &&
            node.parent.callee && node.parent.callee.property &&
            node.parent.callee.property.name == 'CLASS') {

            e.id = 'astnode'+Date.now();
            e.comment = getCLASSComment(node);
            e.lineno = node.parent.loc.start.line;
            e.filename = currentSourceName;
            e.astnode = node;
            e.code = {
                name: getCLASSName(node),
                type: "Model",
                node: node
            };
            e.event = "symbolFound";
            e.finishers = [parser.addDocletRef];

        }
    }
};
