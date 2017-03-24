/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.swift.dao',
  name: 'AbstractDAO',
  implements: [
    'foam.dao.DAO',
  ],
  requires: [
    'foam.dao.ResetListener',
    'foam.dao.LimitedSink',
    'foam.dao.OrderedSink',
    'foam.dao.PredicatedSink',
    'foam.dao.SkipSink',
  ],
  properties: [
    {
      name: 'of',
      swiftType: 'ClassInfo',
    },
    {
      name: 'primaryKey',
      swiftType: 'PropertyInfo',
      swiftExpressionArgs: ['of'],
      swiftExpression: 'return of.axiom(byName: "id") as! PropertyInfo',
    },
  ],
  methods: [
    {
      name: 'put',
      swiftCode: 'fatalError()',
    },
    {
      name: 'remove',
      swiftCode: 'fatalError()',
    },
    {
      name: 'find',
      swiftCode: 'fatalError()',
    },
    {
      name: 'select',
      swiftCode: 'fatalError()',
    },
    {
      name: 'removeAll',
      swiftCode: 'fatalError()'
    },
    {
      name: 'pipe',
      swiftCode: 'fatalError()'
    },
    {
      name: 'where',
      swiftCode: 'fatalError()'
    },
    {
      name: 'orderBy',
      swiftCode: 'fatalError()'
    },
    {
      name: 'skip',
      swiftCode: 'fatalError()'
    },
    {
      name: 'limit',
      swiftCode: 'fatalError()'
    },
    {
      name: 'decorateSink_',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
        },
        {
          name: 'skip',
          swiftType: 'Int?',
        },
        {
          name: 'limit',
          swiftType: 'Int?',
        },
        {
          name: 'order',
          swiftType: 'Comparator?',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
        },
      ],
      swiftReturnType: 'Sink',
      swiftCode: function() {/*
var sink = sink
if limit != nil {
  sink = LimitedSink_create([
    "limit": limit,
    "delegate": sink
  ])
}
if skip != nil {
  sink = SkipSink_create([
    "skip": skip,
    "delegate": sink
  ])
}
if order != nil {
  sink = OrderedSink_create([
    "comparator": order,
    "delegate": sink,
  ])
}
if predicate != nil {
  sink = PredicatedSink_create([
    "predicate": predicate,
    "delegate": sink,
  ])
}
return sink
      */},
    },
    {
      name: 'decorateListener_',
      args: [
        {
          name: 'sink',
          swiftType: 'Sink',
        },
        {
          name: 'skip',
          swiftType: 'Int?',
        },
        {
          name: 'limit',
          swiftType: 'Int?',
        },
        {
          name: 'order',
          swiftType: 'Comparator?',
        },
        {
          name: 'predicate',
          swiftType: 'FoamPredicate?',
        },
      ],
      swiftReturnType: 'Sink',
      swiftCode: function() {/*
// TODO: There are probably optimizations we can make here
// but every time I try it comes out broken.  So for the time being,
// if you have any sort of skip/limit/order/predicate we will just
// issue reset events for everything.
if skip != nil || limit != nil || order != nil || predicate != nil {
  return self.ResetListener_create(["delegate": sink])
}
return sink
      */},
    },
    {
      name: 'listen',
      swiftCode: function() {/*
let mySink = decorateListener_(sink, skip, limit, order, predicate)
return sub(listener: { (sub: Subscription, args: [Any?]) -> Void in
  guard let topic = args[0] as? String else { return }
  switch topic {
    case "put":
      mySink.put(sub, args.last as! FObject)
      break
    case "remove":
      mySink.remove(sub, args.last as! FObject)
      break
    case "reset":
      mySink.reset(sub)
      break
    default:
      break
  }
})
      */},
    },
  ]
});
