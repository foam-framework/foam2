foam.LIB({
  name: 'foam.core.type',
  methods: [
    function toType(str) {
      if ( ! str ) {
        return foam.core.type.Any.create()
      }

      if ( cls = foam.lookup('foam.core.type.' + str, true) ) {
        return cls.create();
      }

      if ( str.endsWith('Array') ) {
        return foam.core.type.Array.create({
          type: foam.core.type.toType(str.substring(0, str.lastIndexOf('Array')))
        })
      }

      if ( of = foam.lookup(str, true) ) {
        return foam.core.type.FObject.create({ of: of })
      }
      console.log('Type: ', str);
      return foam.core.type.CustomType.create({ data: str });
    },
  ],
});

foam.CLASS({
  package: 'foam.core',
  name: 'TypeProperty',
  extends: 'foam.core.Property',
  properties: [
    [
      'adapt',
      function(_, v) {
        /*
        if ( foam.String.isInstance(v) ) {
          if ( cls = foam.lookup('foam.core.type.' + v, true) ) {
            return cls.create();
          }
          // TODO: Making an assumption here that v is an FObject cls. Bad?
          return foam.core.type.FObject.create({ of: v })
        }
        */
        return v;
      }
    ],
    [
      'assertValue',
      function(v) {
        //foam.assert(foam.core.Type.isSubClass(v), 'type is not a subclass of Type:', v);
      }
    ]
  ]
});

foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  properties: [
    {
      class: 'TypeProperty',
      name: 'returns',
      value: 'Void'
    }
  ]
});

/*
foam.INTERFACE({
  package: 'foam.core.type',
  name: 'Type',
  methods: [
    {
      name: 'toJavaType',
      returns: 'String',
    },
  ],
});
*/

foam.CLASS({
  package: 'foam.core.type',
  name: 'Any',
  methods: [
    function toJavaType() { return 'Object' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Object',
  methods: [
    function toJavaType() { return 'Object' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Byte',
  methods: [
    function toJavaType() { return 'byte' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Short',
  methods: [
    function toJavaType() { return 'short' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Integer',
  methods: [
    function toJavaType() { return 'int' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Void',
  methods: [
    function toJavaType() { return 'void' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'String',
  methods: [
    function toJavaType() { return 'String' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Long',
  methods: [
    function toJavaType() { return 'long' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Array',
  requires: [
    'foam.core.type.Any',
  ],
  properties: [
    {
      name: 'type',
      factory: function() {
        return this.Any.create();
      },
    },
  ],
  methods: [
    function toJavaType() {
      return `${this.type.toJavaType()}[]`
    },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Boolean',
  methods: [
    function toJavaType() { return 'boolean' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'FObject',
  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'foam.core.FObject',
    },
  ],
  methods: [
    function toJavaType() { return this.of.id },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  // TODO remove
  name: 'CustomType',
  properties: [
    {
      class: 'String',
      name: 'data',
    },
  ],
  methods: [
    function toJavaType() {
      return this.data
    },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Char',
  methods: [
    function toJavaType() { return 'char' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'DateTime',
  methods: [
    function toJavaType() { return 'java.util.Date' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Time',
  methods: [
    function toJavaType() { return 'java.util.Date' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Date',
  methods: [
    function toJavaType() { return 'java.util.Date' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Context',
  methods: [
    function toJavaType() { return 'foam.core.X' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Number',
  methods: [
    function toJavaType() { return 'float' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Float',
  methods: [
    function toJavaType() { return 'float' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'List',
  methods: [
    function toJavaType() { return 'java.util.List' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Map',
  methods: [
    function toJavaType() { return 'java.util.Map' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Class',
  methods: [
    function toJavaType() { return 'java.core.ClassInfo' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Double',
  methods: [
    function toJavaType() { return 'double' },
  ],
});

foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'TypeProperty',
      name: 'type',
    },
  ],
});
