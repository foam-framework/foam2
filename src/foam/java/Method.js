foam.CLASS({
  package: 'foam.java',
  name: 'Method',

  properties: [
    'name',
    { class: 'String', name: 'visibility' },
    'static',
    'type',
    {
      class: 'FObjectArray',
      of: 'foam.java.Argument',
      name: 'args'
    },
    { class: 'StringArray', name: 'throws' },
    { class: 'foam.java.CodeProperty', name: 'body' }
  ],

  methods: [
    function outputJava(o) {
      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.static ? 'static ' : '',
        this.type, ' ',
        this.name, '(');
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

      o.out(' {\n');

      o.increaseIndent();
      o.out(this.body);
      o.decreaseIndent();
      o.indent();
      o.out('}');
    }
  ]
});
