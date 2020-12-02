/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'Method',

  properties: [
    'name',
    { class: 'String', name: 'visibility' },
    { class: 'String', name: 'documentation' },
    'static',
    'abstract',
    'final',
    'type',
    'synchronized',
    {
      class: 'Boolean',
      name: 'remote'
    },
    {
      class: 'Boolean',
      name: 'setter',
      documentation: 'true iff this method is a setter'
    },
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
      o.out('\n');

      if ( this.documentation ) {
        str = foam.java.Util.removeSpacing(this.documentation);
        lines = foam.java.Util.limitSplit(str, 25);
        o.indent();
        o.out('/**\n');
        for ( i = 0 ; i < lines.length ; i++ ) {
          o.indent();
          o.out('* ' + lines[i]);
          o.out('\n');
        }
        o.indent();
        o.out('*/\n');
      }

      o.indent();
      o.out(this.visibility, this.visibility ? ' ' : '',
        this.abstract     ? 'abstract ' : '',
        this.static       ? 'static ' : '',
        this.final        ? 'final ' : '',
        this.synchronized ? 'synchronized ' : '',
        this.type         ? this.type + ' ' : '',
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

      if ( this.abstract ) {
        o.out(';');
      } else {
        o.out(' {\n');

        o.increaseIndent();
        o.out(this.body);
        o.decreaseIndent();
        o.indent();
        o.out('}');
      }

    }
  ]
});
