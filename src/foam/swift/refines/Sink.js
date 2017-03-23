foam.INTERFACE({
  refines: 'foam.dao.Sink',
  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'sub',
          swiftType: 'Subscription'
        },
        {
          name: 'obj',
          swiftType: 'FObject'
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'remove',
      args: [
        {
          name: 'sub',
          swiftType: 'Subscription'
        },
        {
          name: 'obj',
          swiftType: 'FObject'
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'eof',
      args: [
        {
          name: 'sub',
          swiftType: 'Subscription'
        },
      ],
      swiftEnabled: true,
    },
    {
      name: 'error',
      swiftName: 'foamError',
      swiftEnabled: true,
    },
    {
      name: 'reset',
      args: [
        {
          name: 'sub',
          swiftType: 'Subscription'
        },
      ],
      swiftEnabled: true,
    },
  ]
});

foam.CLASS({
  package: 'foam.dao',
  name: 'ResetListener',
  extends: 'foam.dao.ProxySink',
  documentation: 'Turns all sink events into a reset event.',
  methods: [
    function put(sub) {
      this.reset(sub);
    },
    function remove(sub) {
      this.reset(sub);
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.ResetListener',
  methods: [
    {
      name: 'put',
      swiftCode: 'reset(sub)',
    },
    {
      name: 'remove',
      swiftCode: 'reset(sub)',
    },
  ]
});

foam.CLASS({
  refines: 'foam.dao.PredicatedSink',
  methods: [
    {
      name: 'put',
      swiftCode: 'if predicate.f(obj) { delegate.put(sub, obj) }'
    },
    {
      name: 'remove',
      swiftCode: 'if predicate.f(obj) { delegate.remove(sub, obj) }'
    }
  ]
});

foam.CLASS({
  refines: 'foam.dao.LimitedSink',
  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
count += 1
if count <= limit {
  delegate.put(sub, obj)
}
      */}
    },
    {
      name: 'remove',
      swiftCode: function() {/*
count += 1
if count <= limit {
  delegate.remove(sub, obj)
}
      */}
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.SkipSink',
  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
if count < skip {
  count += 1
  return
}
delegate.put(sub, obj)
      */}
    },
    {
      name: 'remove',
      swiftCode: function() {/*
if count < skip {
  count += 1
  return
}
delegate.remove(sub, obj)
      */}
    }
  ]
});


foam.CLASS({
  refines: 'foam.dao.OrderedSink',
  methods: [
    {
      name: 'put',
      swiftCode: function() {/*
array.append(obj)
      */}
    },
    {
      name: 'eof',
      swiftCode: function() {/*
array.sort(by: {
  return comparator.compare($0, $1) == 0
});

for obj in array {
  delegate.put(sub, obj as! FObject)
}
      */}
    },
    {
      name: 'remove',
      swiftCode: function() {/*
// TODO
      */},
    },
  ]
});
