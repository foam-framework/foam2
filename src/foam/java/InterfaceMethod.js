foam.CLASS({
  package: 'foam.java',
  name: 'InterfaceMethod',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'visibility'
    },
    'type',
    {
      class: 'FObjectArray',
      of: 'foam.java.Argument',
      name: 'args'
    },
    {
      name: 'body',
      documentation: 'Dummy property to silence warnings',
      setter: function() {},
      getter: function() {}
    },
    { class: 'StringArray', name: 'throws' }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.type, ' ', this.name, '(');

      for ( var i = 0 ; this.args && i < this.args.length ; i++ ) {
        o.out(this.args[i]);
        if ( i != this.args.length - 1 ) o.out(', ');
      }

      o.out(')');

      if ( this.throws.length > 0 ) {
        o.out(" throws ");
        for ( var i = 0 ; i < this.throws.length ; i++ ) {
          o.out(this.throws[i]);
          if ( i < this.throws.length - 1 ) o.out(", ");
        }
      }

      o.out(';\n');
    }
  ]
});
