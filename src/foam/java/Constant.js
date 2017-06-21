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
    'javaType',
    'value',
    'javaValue',
    'documentation'
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

      if ( this.type == undefined ) {
        if ( foam.Boolean.isInstance(this.value) ) {
          o.out('Boolean');
        }
        else if ( foam.Number.isInstance(this.value) ) {
          if ( Number.isInteger(this.value) ) {
            if ( this.value < 2147483647 ) { //MAX INT VALUE
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
          throw 'Constant type not defined';
        }
      } else {
        o.out(this.type);
      }

      o.out(' ' + this.name);
      o.out(' = ');

      // if the user has declared a type that requires a custom instantiation,
      // but not declare a javaType for it, the Java code should break on compile
      if ( this.javaValue == undefined ) {
        if ( foam.String.isInstance(this.value) ) {
          o.out('\"' + this.value + '\"');
        } else {
          o.out(this.value);
        }
      } else {
        o.out(this.javaValue);
      }

      o.out(';\n');
    }
  ]
});
