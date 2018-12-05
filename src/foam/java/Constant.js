/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.java',
  name: 'Constant',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'type',
    },
    {
      name: 'value'
    },
    {
      class: 'String',
      name: 'documentation'
    }
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

      if ( this.documentation ) {
        o.out('/* ', this.documentation, ' */\n');
        o.indent();
      }

      o.out('public static final ');
      o.out(this.type);
      o.out(' ' + this.name);
      o.out(' = ');
      o.out(this.value);
      o.out(';\n');
    }
  ]
});
