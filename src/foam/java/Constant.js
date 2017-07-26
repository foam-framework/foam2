/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'Constant',

  properties: [
    'name',
    'type',
    'value',
    'documentation'
  ],

  constants: [
    {
      name: 'MIN_INT_VALUE',
      value: -2147483648
    },
    {
      name: 'MAX_INT_VALUE',
      value: 2147483647
    },
  ],

  methods: [
    function outputJava(o) {
      o.indent();

      if ( this.documentation != undefined ) {
        o.out('/* ', this.documentation, ' */\n');
        o.indent();
        o.indent();
      }

      o.out('public static final ');

      if ( ! this.type ) {
        if ( foam.Boolean.isInstance(this.value) ) {
          o.out('Boolean');
        }
        else if ( foam.Number.isInstance(this.value) ) {
          if ( Number.isInteger(this.value) ) {
            if ( this.value >= this.MIN_INT_VALUE && this.value <= this.MAX_INT_VALUE ) {
              o.out('int');
            } else {
              o.out('long');
            }
          } else {
            o.out('double')
          }
        } else if ( foam.String.isInstance(this.value) ) {
          o.out('String');
        } else {
          throw 'Constant type needs to be defined';
        }
      } else {
        o.out(this.type);
      }

      o.out(' ' + this.name);
      o.out(' = ');

      // if the user has declared a type that requires a custom instantiation,
      // but not declare a javaType for it, the Java code should break on compile
      if ( ( ! this.type && ! foam.String.isInstance(this.value) ) || ( this.type && this.type != 'String' ) ) {
        o.out(this.value);
      } else {
        var escapedValue = this.escapeString(this.value);
        o.out('\"' + escapedValue + '\"');
      }

      o.out(';\n');
    },

    function escapeString(s) {
      var escapedValue = '';
      for ( var i = 0 ; i < this.value.length ; i++ ) {
        var c = this.value.charAt(i);
        switch(c) {
          case '\\' :
            escapedValue += '\\\\';
            break;
          case '\"' :
            escapedValue += '\\\"';
            break;
          case '\n' :
            escapedValue += '\\n';
            break;
          default:
            escapedValue += c;
        }
      }
      return escapedValue;
    }
  ]
});
