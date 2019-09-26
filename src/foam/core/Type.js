/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.LIB({
  name: 'foam.core.type',
  methods: [
    function toType(str) {
      if ( ! str ) {
        return foam.core.type.Any.create()
      }

      if ( foam.isRegistered('foam.core.type.' + str) ) {
        return foam.lookup("foam.core.type." + str).create();
      }

      if ( str.endsWith('[]') ) {
        return foam.core.type.Array.create({
          type: foam.core.type.toType(str.substring(0, str.lastIndexOf('[]')))
        })
      }

      if ( foam.isRegistered(str) ) {
        return foam.core.type.FObject.create({ of: str })
      }

      return foam.core.type.SimpleType.create({
        java: str,
        swift: str
      });
    }
  ]
});


foam.INTERFACE({
  package: 'foam.core.type',
  name: 'Type',
  methods: [
    {
      name: 'refs',
      type: 'String[]',
    },
    {
      name: 'toJavaType',
      type: 'String'
    },
    {
      name: 'toSwiftType',
      args: [
        { type: 'Boolean', name: 'optional' },
      ],
      type: 'String'
    }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'SimpleType',
  properties: [
    {
      class: 'String',
      name: 'java'
    },
    {
      class: 'String',
      name: 'swift'
    },
  ],
  methods: [
    function refs() { return [] },
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
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return [] },
    function toJavaType() { return 'Object' },
    function toSwiftType() { return 'Any?' }
  ],
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Object',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'Object'],
    ['swift', 'Any']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Byte',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'byte'; },
    function toSwiftType() { return 'Int8'; }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Short',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'short'; },
    function toSwiftType() { return 'Int16'; }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Integer',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'int'; },
    function toSwiftType() { return 'Int'; }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Void',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'void'; },
    function toSwiftType() { return 'Void'; }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'String',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'String'],
    ['swift', 'String']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Long',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'long'; },
    function toSwiftType() { return 'Int'; }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Array',
  implements: ['foam.core.type.Type'],
  // Should be Multiton, but multitons don't work for non-string properties.
  // axioms: [ { class: 'foam.pattern.Multiton', property: 'type' } ],
  properties: [
    {
      name: 'type'
    }
  ],
  methods: [
    function refs() { return this.type.refs() },
    function toJavaType() {
      return `${this.type.toJavaType()}[]`
    },
    function toSwiftType(optional) {
      return `[${this.type.toSwiftType()}]` + (optional ? '?' : '')
    }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Boolean',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'boolean'; },
    function toSwiftType() { return 'Bool'; }
  ]
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
    }
  ],
  methods: [
    function refs() { return [this.of.id] },
    function toJavaType() { return this.of.id },
    function toSwiftType(optional) {
      return this.of.model_.swiftName + (optional ? '?' : '')
    }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Char',
  implements: ['foam.core.type.Type'],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  methods: [
    function refs() { return []; },
    function toJavaType() { return 'char'; },
    function toSwiftType() { return 'Character'; }
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'DateTime',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'java.util.Date'],
    ['swift', 'Date']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Time',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'java.util.Date'],
    ['swift', 'Date']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Date',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'java.util.Date'],
    ['swift', 'Date']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Context',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'foam.core.X'],
    ['swift', 'Context']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Number',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'float'],
    ['swift', 'Float']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Float',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'float'],
    ['swift', 'Float']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'List',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'java.util.List'],
    ['swift', '[Any?]']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Map',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'java.util.Map'],
    ['swift', '[AnyHashable:Any?]']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Class',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'foam.core.ClassInfo'],
    ['swift', 'ClassInfo']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Double',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'double'],
    ['swift', 'Double']
  ]
});


foam.CLASS({
  package: 'foam.core.type',
  name: 'Regex',
  extends: 'foam.core.type.SimpleType',
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    ['java', 'java.util.regex.Pattern'],
    ['swift', 'String']
  ]
});
