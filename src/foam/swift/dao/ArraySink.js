foam.CLASS({
  package: 'foam.swift.dao',
  name: 'ArraySink',
  implements: [
    'foam.dao.Sink',
  ],
  properties: [
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'dao',
      swiftFactory: 'return []',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'dao.append(obj)',
    },
    {
      name: 'eof',
      swiftCode: 'return',
    },
    {
      name: 'swiftSinkError',
      swiftCode: 'return',
    },
    {
      name: 'reset',
      swiftCode: 'return',
    },
  ]
});
