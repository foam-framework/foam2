/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.swift',
  methods: [
    function stringify(v) {
      var type = foam.typeOf(v);

      if ( type == foam.Number || type == foam.Boolean ) {
        return `${v}`;
      } else if ( type == foam.String ) {
        return `"${v
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
        }"`;
      } else {
        console.log('Encountered unexpected type while converitng value to string');
        debugger;
      }
    },
  ],
});
