/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.swift.dao',
  name: 'ArrayDAO',
  extends: 'foam.dao.AbstractDAO',
  properties: [
    {
      class: 'Array',
      of: 'foam.core.FObject',
      name: 'dao',
      swiftFactory: 'return []',
    },
    {
      swiftType: 'ClassInfo',
      name: 'of',
    },
    {
      swiftType: 'PropertyInfo',
      name: 'primaryKey',
      swiftExpressionArgs: ['of'],
      swiftExpression: 'return of.axiom(byName: "id") as! PropertyInfo',
    },
  ],
  methods: [
    {
      name: 'put_',
      swiftCode: function() {/*
var found = false
for (i, o) in dao.enumerated() {
  if primaryKey.compare(obj, o) == 0 {
    dao[i] = obj
    found = true
    break
  }
}
if !found { dao.append(obj) }
_ = on["put"].pub([obj])
return obj
      */},
    },
    {
      name: 'remove_',
      swiftCode: function() {/*
let i = dao.index { (o) -> Bool in
  return self.primaryKey.compare(obj, o) == 0
}
if i == nil { return nil }
let o = dao.remove(at: i!)
_ = on["remove"].pub([obj])
return o
      */},
    },
    {
      name: 'find_',
      swiftCode: function() {/*
let i = dao.index { (o) -> Bool in
  return self.primaryKey.compareValues(id, self.primaryKey.get(o)) == 0
}
if i == nil { return nil }
return dao[i!]
      */},
    },
    {
      name: 'select_',
      swiftCode: function() {/*
let resultSink = sink
let sink = decorateSink_(resultSink, skip, limit, order, predicate)

var detached = false
let sub = Subscription(detach: { detached = true })

for o in dao {
  if detached { break }
  sink.put(o, sub)
}
sink.eof()

return resultSink
      */},
    },
  ]
});
