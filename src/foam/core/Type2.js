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
      return foam.core.type.QuickType.create({
        java: str,
        swift: str,
      });
    },
  ],
});

foam.INTERFACE({
  package: 'foam.core.type',
  name: 'Type',
  methods: [
    {
      name: 'toJavaType',
      returns: 'String',
    },
    {
      name: 'toSwiftType',
      args: [
        { type: 'Boolean', name: 'optional' },
      ],
      returns: 'String',
    },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'QuickType',
  properties: [
    {
      class: 'String',
      name: 'java',
    },
    {
      class: 'String',
      name: 'swift',
    },
  ],
  methods: [
    function toJavaType() { return this.java },
    function toSwiftType(optional) {
      return this.swift + (optional ? '?' : '')
    },
  ]
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Any',
  implements: ['foam.core.type.Type'],
  methods: [
    function toJavaType() { return 'Object' },
    function toSwiftType() { return 'Any?' },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Object',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'Object'],
    ['swift', 'Any'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Byte',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'byte'],
    ['swift', 'Int8'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Short',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'short'],
    ['swift', 'Int16'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Integer',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'int'],
    ['swift', 'Int'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Void',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'void'],
    ['swift', 'Void'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'String',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'String'],
    ['swift', 'String'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Long',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'long'],
    ['swift', 'Int'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Array',
  implements: ['foam.core.type.Type'],
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
    function toSwiftType(optional) {
      return `[${this.type.toSwiftType()}]` + (optional ? '?' : '')
    },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Boolean',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'boolean'],
    ['swift', 'Bool'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'FObject',
  implements: ['foam.core.type.Type'],
  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'foam.core.FObject',
    },
  ],
  methods: [
    function toJavaType() { return this.of.id },
    function toSwiftType(optional) {
      return this.of.model_.swiftName + (optional ? '?' : '')
    },
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Char',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'char'],
    ['swift', 'Character'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'DateTime',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'java.util.Date'],
    ['swift', 'Date'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Time',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'java.util.Date'],
    ['swift', 'Date'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Date',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'java.util.Date'],
    ['swift', 'Date'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Context',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'foam.core.X'],
    ['swift', 'Context'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Number',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'float'],
    ['swift', 'Float'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Float',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'float'],
    ['swift', 'Float'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'List',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'java.util.List'],
    ['swift', '[Any?]'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Map',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'java.util.Map'],
    ['swift', '[AnyHashable:Any?]'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Class',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'java.core.ClassInfo'],
    ['swift', 'ClassInfo'],
  ],
});

foam.CLASS({
  package: 'foam.core.type',
  name: 'Double',
  extends: 'foam.core.type.QuickType',
  properties: [
    ['java', 'double'],
    ['swift', 'Double'],
  ],
});
