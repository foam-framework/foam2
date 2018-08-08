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
      } else if ( type == foam.Array ) {
        return `[${v.map(foam.swift.stringify).join(',')}]`;
      } else if ( type == foam.Function ) {
        // Unable to convert functions.
        return 'nil';
      } else if ( type == foam.core.FObject ) {
        // TODO: Should be able to serialize an FObject to swift.
        return 'nil';
      } else  {
        console.log('Encountered unexpected type while converitng value to string:', v);
        debugger;
      }
    },
  ],
});
