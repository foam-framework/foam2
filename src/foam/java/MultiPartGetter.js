foam.CLASS({
  package: 'foam.java',
  name: 'MultiPartGetter',

  properties: [
    'props',
    'clsName'
  ],

  methods: [
    function outputJava(o) {
      var props = this.props;
      if ( props.length == 1 ) {
        o.indent();
        o.out('return get', foam.String.capitalize(props[0].name), '();\n');
        return;
      }

      o.indent();
      o.out('return new foam.core.CompoundKey(new Object[] {\n');
      o.increaseIndent();
      for ( var i = 0 ; i < props.length ; i++ ) {
        o.indent();
        o.out('get', foam.String.capitalize(props[i].name), '()');
        if ( i != props.length - 1 ) o.out(',\n');
      }
      o.decreaseIndent();
      o.out('\n');
      o.indent()
      o.out('}, new foam.core.PropertyInfo[] {\n');
      o.increaseIndent();
      o.indent();
      for ( var i = 0 ; i < props.length ; i++ ) {
        o.out(this.clsName, '.', foam.String.constantize(props[i].name));
        if ( i != props.length - 1 ) o.out(',\n');
      }
      o.out('\n');
      o.decreaseIndent();
      o.indent()
      o.out('});\n');
    }
  ]
});
