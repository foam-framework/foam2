/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.dao',
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.mlang.predicate.True',
  ],
  properties: [
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'array',
      swiftFactory: 'return []',
    },
  ],
  methods: [
    {
      name: 'put_',
      swiftCode: function() {/*
var found = false
for (i, o) in array.enumerated() {
  if primaryKey.compare(obj, o) == 0 {
    array[i] = obj
    found = true
    break
  }
}
if !found { array.append(obj) }
_ = on["put"].pub([obj])
return obj
      */},
    },
    {
      name: 'remove_',
      swiftCode: function() {/*
let i = array.index { (o) -> Bool in
  return self.primaryKey.compare(obj, o) == 0
}
if i == nil { return nil }
let o = array.remove(at: i!)
_ = on["remove"].pub([obj])
return o
      */},
    },
    {
      name: 'find_',
      swiftCode: function() {/*
let i = array.index { (o) -> Bool in
  return self.primaryKey.compareValues(id, self.primaryKey.get(o)) == 0
}
if i == nil { return nil }
return array[i!]
      */},
    },
    {
      name: 'select_',
      swiftCode: function() {/*
let resultSink = sink
let sink = decorateSink_(resultSink, skip, limit, order, predicate)

var detached = false
let sub = Subscription(detach: { detached = true })

for o in array {
  if detached { break }
  sink.put(o, sub)
}
sink.eof()

return resultSink
      */},
    },
    {
      name: 'removeAll_',
      swiftCode: `
let predicate: foam_mlang_predicate_Predicate = predicate ?? True_create()
var skip: Int = skip ?? 0;
var limit: Int = limit ?? Int.max

for (i, o) in array.enumerated() {
  if predicate.f(o) {
    if skip > 0 {
      skip -= 1
      continue
    }
    array.remove(at: i)
    limit -= 1
    _ = on["remove"].pub([o])
  }
}
      `,
    },
  ]
});
