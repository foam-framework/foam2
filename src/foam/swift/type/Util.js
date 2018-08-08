foam.CLASS({
  package: 'foam.swift.type',
  name: 'Util',
  requires: [
    'foam.swift.type.Array',
    'foam.swift.type.Boolean',
    'foam.swift.type.Date',
    'foam.swift.type.FObject',
    'foam.swift.type.Map',
    'foam.swift.type.Null',
    'foam.swift.type.Number',
    'foam.swift.type.String',
    'foam.swift.type.Unknown',
  ],
  axioms: [ { class: 'foam.pattern.Singleton' } ],
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tFObject',
      required: true,
      swiftFactory: 'return FObject_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tUnknown',
      required: true,
      swiftFactory: 'return Unknown_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tDate',
      required: true,
      swiftFactory: 'return Date_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tArray',
      required: true,
      swiftFactory: 'return Array_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tString',
      required: true,
      swiftFactory: 'return String_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tNumber',
      required: true,
      swiftFactory: 'return Number_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tBoolean',
      required: true,
      swiftFactory: 'return Boolean_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tNull',
      required: true,
      swiftFactory: 'return Null_create()',
    },
    {
      class: 'FObjectProperty',
      of: 'foam.swift.type.Type',
      name: 'tMap',
      required: true,
      swiftFactory: 'return Map_create()',
    },
  ],
  methods: [
    {
      name: 'typeOf',
      args: [
        { name: 'o' },
      ],
      returns: 'foam.swift.type.Type',
      swiftCode: `
        if tNull.isInstance(o) { return tNull }
        if tBoolean.isInstance(o) { return tBoolean }
        if tString.isInstance(o) { return tString }
        if tNumber.isInstance(o) { return tNumber }
        if tArray.isInstance(o) { return tArray }
        if tDate.isInstance(o) { return tDate }
        if tFObject.isInstance(o) { return tFObject }
        if tMap.isInstance(o) { return tMap }
        return tUnknown
      `,
    },
    {
      name: 'compare',
      args: [
        { name: 'a' },
        { name: 'b' },
      ],
      swiftReturns: 'Int',
      swiftCode: `
        let aType = typeOf(a)
        let bType = typeOf(b)
        return aType.ordinal > bType.ordinal ? 1 :
            aType.ordinal < bType.ordinal ? -1 : aType.compare(a, b);
      `,
    },
  ],
});
