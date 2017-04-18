foam.CLASS({
  package: 'foam.java',
  name: 'MultiPartSetter',

  properties: [
    'props',
    'clsName'
  ],

  methods: [
    function outputJava(o) {
      var props = this.props;
      if ( props.length == 1 ) {
        o.indent();
        o.out('set', foam.String.capitalize(props[0].name), '((', props[0].javaType, ')val);\n');
        o.indent();
        o.out('return this;\n');
        return;
      }

      o.indent();
      o.out('Object[] values = val.getValues();\n');
      for ( var i = 0 ; i < props.length ; i++ ) {
        o.indent();
        o.out('set', foam.String.capitalize(props[i].name), '((', props[i].javaType, ')values[', i, ']);\n');
      }
      o.indent();
      o.out('return this;\n');
    }
  ]
});
