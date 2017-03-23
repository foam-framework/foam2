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
      name: 'remove',
      swiftCode: function() {/*
dao.remove(at: dao.index(where: { (o) -> Bool in
  return FOAM_utils.equals(o, obj)
})!)
      */},
    },
    {
      name: 'eof',
      swiftCode: 'return',
    },
    {
      name: 'error',
      swiftCode: 'return',
    },
    {
      name: 'reset',
      swiftCode: 'return',
    },
  ]
});
