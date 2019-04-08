/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.swift',
  flags: ['swift'],
  methods: [
    function asSwiftValue(v) {
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
        return `[${v.map(foam.swift.asSwiftValue).join(',')}]`;
      } else if ( type == foam.Undefined ) {
        return 'nil';
      } else if ( type == foam.Function ) {
        // Unable to convert functions.
        return 'nil';
      } else if ( type == foam.Null ) {
        return 'nil';
      } else if ( type == foam.core.FObject ) {
        // TODO: Should be able to serialize an FObject to swift.
        return 'nil';
      } else  {
        console.log('Encountered unexpected type while converitng value to string:', v);
        debugger;
        return 'nil';
      }
    },
    function isNullable(type) {
      return !! type.match(/[?!]$/);
    },
    function requiresCast(type) {
      return type != 'Any?' && type != 'Any!'
    },
    function toSwiftType(type, optional) {
      return foam.core.type.toType(type).toSwiftType(optional)
    },
    function toSwiftName(id) {
      return id.replace(/\./g, '_')
    },
  ],
});

foam.CLASS({
  package: 'foam.swift',
  name: 'SwiftTypeProperty',
  extends: 'String',
  flags: ['swift'],
  properties: [
    {
      name: 'flags',
      value: ['swift']
    },
    {
      name: 'expression',
      value: function(type) {
        return foam.swift.toSwiftType(type);
      }
    },
    {
      name: 'name',
      value: 'swiftType'
    }
  ]
});
